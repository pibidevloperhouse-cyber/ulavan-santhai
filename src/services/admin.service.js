import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import * as adminRepository from '../repositories/admin.repository.js';
import * as profileRepository from '../repositories/profile.repository.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('[SECURITY FATAL] JWT_SECRET is not configured in environment variables.');
}

const ADMIN_JWT_EXPIRES_IN = '24h';
const ALLOWED_ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'Administrator'];

/**
 * Service: Authenticate Administrator
 * Validates credentials against public.admin_users and issues a 24-hour admin JWT token.
 * @param {object} input
 * @param {string} input.email
 * @param {string} input.password
 * @returns {Promise<object>} Admin auth response matching frontend specification
 */
export const adminLoginService = async ({ email, password } = {}) => {
  // 1. Validate inputs
  if (!email || !password) {
    const error = new Error('Email and password are required.');
    error.statusCode = 400;
    throw error;
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const rawPassword = String(password);

  // 2. Find admin in public.admin_users database
  const admin = await adminRepository.findByEmail(cleanEmail);
  if (!admin) {
    const error = new Error('Invalid login credentials.');
    error.statusCode = 401;
    throw error;
  }

  // 3. Confirm admin account is active
  if (!admin.isActive) {
    const error = new Error('Access denied. Administrator account is deactivated.');
    error.statusCode = 403;
    throw error;
  }

  // 4. Confirm administrator authorization role
  const hasRole = ALLOWED_ADMIN_ROLES.some(
    (role) => role.toUpperCase() === String(admin.role).toUpperCase()
  );

  if (!hasRole) {
    const error = new Error('Access denied. Administrator privileges required.');
    error.statusCode = 403;
    throw error;
  }

  // 5. Check password hash with bcrypt
  const isMatch = await bcrypt.compare(rawPassword, admin.password);
  if (!isMatch) {
    const error = new Error('Invalid login credentials.');
    error.statusCode = 401;
    throw error;
  }

  // 6. Generate 24-hour Admin JWT token
  const token = jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      isAdmin: true,
    },
    JWT_SECRET,
    { expiresIn: ADMIN_JWT_EXPIRES_IN }
  );

  console.log(`[ADMIN AUTH] Administrator logged in: ${admin.email} (Role: ${admin.role})`);

  // 7. Return exact frontend response structure (no name/title in user object)
  return {
    success: true,
    message: 'Admin authenticated successfully',
    token,
    user: {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    },
  };
};

/**
 * Service: Fetch all buyers for Admin Portal
 * Reads all buyer profiles and seller profiles joined with users table.
 * Resolves user name from users table via user_id.
 * Formats strictly according to the frontend BuyersTab interface.
 * @returns {Promise<Array<object>>}
 */
export const getAllBuyersService = async () => {
  const { buyers, sellers, onboardedBuyerUsers = [] } = await profileRepository.findAllBuyersWithUserDetails();

  const buyerUserIds = new Set();
  const formattedBuyers = [];

  // 1. Process actual buyer_profiles
  for (const bp of buyers) {
    buyerUserIds.add(bp.userId);

    let commodities = bp.targetCommodities;
    if (!commodities && bp.categoryDetails) {
      if (Array.isArray(bp.categoryDetails.individualCommodities) && bp.categoryDetails.individualCommodities.length > 0) {
        commodities = bp.categoryDetails.individualCommodities.join(', ');
      } else if (bp.categoryDetails.mfgRawMaterials) {
        commodities = bp.categoryDetails.mfgRawMaterials;
      }
    }
    if (!commodities) {
      commodities = 'Paddy, Organic Vegetables, Millets, Oilseeds';
    }

    const operatingDistrict = bp.city
      ? `${bp.city}, ${bp.district}`
      : bp.district
      ? `${bp.district}, Tamil Nadu`
      : 'Tamil Nadu';

    const registeredDate = bp.createdAt
      ? new Date(bp.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : 'Active';

    formattedBuyers.push({
      id: bp.id,
      userId: bp.userId,
      // Real user name strictly retrieved from users table (joined via bp.user_id = users.id)
      name: bp.userName || bp.businessName || 'Agri Mandi Buyer',
      businessName: bp.businessName || '',
      contactName: bp.userName || 'Procurement Desk',
      phone: bp.userMobile || '',
      email: bp.userEmail || '',
      district: bp.district || 'Coimbatore',
      operatingDistrict,
      buyerType: bp.buyerType || 'Business / Mandi Trader',
      sellersViewable: '0 / 10',
      subscriptionStatus: 'Verified Annual Access (₹365/Yr)',
      status: 'Active',
      registeredDate,
      interestCommodities: commodities,
      procurementVolume: bp.procurementVolume || bp.categoryDetails?.individualVolume || 'Regular',
      isGst: Boolean(bp.isGst),
      gstin: bp.gstin || bp.categoryDetails?.mfgGstin || bp.categoryDetails?.resellerGstin || '',
      fssaiNumber: bp.fssaiNumber || '',
      address: bp.address || '',
      sourceTable: 'buyer_profiles',
    });
  }

  // 2. Also check seller_profiles for any users with buyer_onboarded or profiles as requested by user
  for (const sp of sellers) {
    if (!buyerUserIds.has(sp.userId) && sp.buyerOnboarded) {
      buyerUserIds.add(sp.userId);

      const registeredDate = sp.createdAt
        ? new Date(sp.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : 'Active';

      formattedBuyers.push({
        id: `BP_${sp.id.replace('SP_', '')}`,
        userId: sp.userId,
        // Real user name strictly retrieved from users table (joined via sp.user_id = users.id)
        name: sp.userName || sp.businessName || 'Wholesale Buyer',
        businessName: sp.businessName || '',
        contactName: sp.userName || 'Procurement Desk',
        phone: sp.userMobile || '',
        email: sp.userEmail || '',
        district: sp.district || 'Coimbatore',
        operatingDistrict: `${sp.district || 'Coimbatore'}, Tamil Nadu`,
        buyerType: 'Business / Mandi Trader',
        sellersViewable: '0 / 10',
        subscriptionStatus: 'Verified Annual Access (₹365/Yr)',
        status: 'Active',
        registeredDate,
        interestCommodities: sp.primaryProducts || 'Paddy, Organic Vegetables, Millets',
        procurementVolume: sp.capacity || 'Regular',
        isGst: Boolean(sp.isGst),
        gstin: sp.gstin || '',
        fssaiNumber: sp.fssaiNumber || '',
        address: sp.farmAddress || '',
        sourceTable: 'seller_profiles',
      });
    }
  }

  // 3. Ensure any user with buyer_onboarded = true or buyer_paid = true without a profile row still shows up
  for (const u of onboardedBuyerUsers) {
    if (!buyerUserIds.has(u.id)) {
      buyerUserIds.add(u.id);

      const registeredDate = u.createdAt
        ? new Date(u.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : 'Active';

      formattedBuyers.push({
        id: `USR_${u.id.replace('usr_', '').slice(0, 8).toUpperCase()}`,
        userId: u.id,
        name: u.name || 'Registered Buyer',
        businessName: '',
        contactName: u.name || 'Registered Buyer',
        phone: u.mobile || '',
        email: u.email || '',
        district: 'Tamil Nadu',
        operatingDistrict: 'Tamil Nadu',
        buyerType: 'Verified Buyer',
        sellersViewable: '0 / 10',
        subscriptionStatus: u.buyerPaid
          ? 'Verified Annual Access (₹365/Yr)'
          : 'Active Member',
        status: 'Active',
        registeredDate,
        interestCommodities: 'Fresh Vegetables, Fruits, Millets, Paddy',
        procurementVolume: 'Regular',
        isGst: false,
        gstin: '',
        fssaiNumber: '',
        address: '',
        sourceTable: 'users',
      });
    }
  }

  return formattedBuyers;
};

/**
 * Service: Update buyer profile
 * @param {string} id
 * @param {object} updateData
 * @returns {Promise<object>}
 */
export const updateBuyerService = async (id, updateData) => {
  const cleanId = String(id || '').replace(/[<>]/g, '').trim();
  const updated = await profileRepository.updateBuyerById(cleanId, updateData);
  return updated;
};

const SELLER_CATEGORY_LABELS = {
  'CAT-SEL-01': 'Farmer & Cultivators',
  'CAT-SEL-02': 'Agricultural Producer (FPO)',
  'CAT-SEL-03': 'Organic Producer',
  'CAT-SEL-04': 'Raw-Material Provider',
  'CAT-SEL-05': 'Ingredient Producer',
  'CAT-SEL-06': 'Manufacturer',
  'CAT-SEL-07': 'Value-Added Manufacturer',
  'CAT-SEL-08': 'Other Agri Enterprises',
};

const APP_STATUS_TO_UI = {
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  SUSPENDED: 'Suspended',
  PENDING_REVIEW: 'Pending Review',
};

/**
 * Extract human-readable products offered from seller categoryDetails JSONB
 */
const extractSellerProducts = (details = {}) => {
  if (details.productsOffered) return String(details.productsOffered);

  const listKeys = ['crops', 'fpoCrops', 'organicCrops', 'rawCommodities'];
  for (const key of listKeys) {
    if (Array.isArray(details[key]) && details[key].length > 0) {
      return details[key].join(', ');
    }
  }

  const textKeys = ['ingProducts', 'mfgProductsOffered', 'vamProducts', 'otherProducts'];
  for (const key of textKeys) {
    if (details[key]) return String(details[key]);
  }

  return 'Direct Agricultural Harvest';
};

/**
 * Service: Fetch all sellers for Admin Portal
 * Reads all records from seller_profiles joined with users table (name, email, mobile via user_id)
 * and latest seller application status/documents.
 * Formats strictly according to frontend SellersTab interface.
 * @returns {Promise<Array<object>>}
 */
export const getAllSellersService = async () => {
  const {
    sellers,
    sellerApps,
    onboardedSellerUsers = [],
    uploadedDocs = [],
  } = await profileRepository.findAllSellersWithUserDetails();

  // Map latest seller application per userId
  const latestAppByUser = new Map();
  for (const app of sellerApps) {
    if (!latestAppByUser.has(app.userId)) {
      latestAppByUser.set(app.userId, app);
    }
  }

  // Group uploaded documents per userId
  const docsByUser = new Map();
  for (const doc of uploadedDocs) {
    if (!docsByUser.has(doc.userId)) {
      docsByUser.set(doc.userId, []);
    }
    docsByUser.get(doc.userId).push(doc);
  }

  const sellerUserIds = new Set();

  const formattedSellers = sellers.map((sp) => {
    sellerUserIds.add(sp.userId);
    const details = sp.categoryDetails || {};
    const app = latestAppByUser.get(sp.userId);

    const sellerTypes = Array.isArray(sp.sellerType)
      ? sp.sellerType.map((code) => SELLER_CATEGORY_LABELS[code] || code)
      : sp.sellerType
      ? [SELLER_CATEGORY_LABELS[sp.sellerType] || sp.sellerType]
      : ['Farmer & Cultivators'];

    const uiStatus =
      details.adminStatus ||
      (app?.overallStatus && APP_STATUS_TO_UI[app.overallStatus.toUpperCase()]) ||
      (sp.sellerPaid ? 'Approved' : 'Pending Review');

    const address =
      sp.farmAddress ||
      [sp.village, sp.district, sp.pinCode].filter(Boolean).join(', ') ||
      'Tamil Nadu';

    const certifications = [];
    if (app?.documents && typeof app.documents === 'object') {
      for (const [docKey, docVal] of Object.entries(app.documents)) {
        if (docVal && typeof docVal === 'object') {
          certifications.push({
            name: docVal.documentType || docKey.replace(/_/g, ' '),
            number: docVal.documentId || docVal.fileName || 'Uploaded',
            authority: 'Verified Upload',
            validity: 'Submitted',
            url: docVal.url || null,
          });
        }
      }
    }
    if (certifications.length === 0) {
      const userDocs = docsByUser.get(sp.userId) || [];
      for (const d of userDocs) {
        certifications.push({
          name: d.documentType || 'Uploaded Document',
          number: d.id || d.fileName,
          authority: 'Verified Upload',
          validity: d.status || 'Uploaded',
          url: d.fileUrl || null,
        });
      }
    }
    if (sp.gstin) {
      certifications.push({
        name: 'GSTIN Registration',
        number: sp.gstin,
        authority: 'GST Council India',
        validity: 'Active',
      });
    }
    if (sp.fssaiNumber) {
      certifications.push({
        name: 'FSSAI Food License',
        number: sp.fssaiNumber,
        authority: 'FSSAI India',
        validity: 'Active',
      });
    }
    if (details.organicScopeNumber) {
      certifications.push({
        name: details.organicCertStatus || 'Organic Certification',
        number: details.organicScopeNumber,
        authority: details.organicCertAgency || 'NPOP / PGS-India',
        validity: 'Active',
      });
    }
    if (certifications.length === 0) {
      certifications.push({
        name: 'Cultivator Onboarding Record',
        number: sp.id,
        authority: 'Ulavan Santhai Verification',
        validity: sp.sellerOnboarded ? 'Onboarded' : 'Pending',
      });
    }

    const registeredDate = sp.createdAt
      ? new Date(sp.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : 'Active';

    return {
      id: sp.id,
      userId: sp.userId,
      businessName: sp.businessName || sp.userName || 'Direct Farm Producer',
      sellerType: sellerTypes.join(', '),
      contactName: sp.userName || 'Primary Cultivator',
      phone: sp.userMobile || '',
      email: sp.userEmail || '',
      district: sp.district || 'Coimbatore',
      village: sp.village || '',
      pinCode: sp.pinCode || '',
      subscription: sp.sellerPaid ? 'Active (₹365/Yr)' : 'Pending / Trial',
      status: uiStatus,
      address,
      productsOffered: extractSellerProducts(details),
      certifications,
      registeredDate,
      isGst: Boolean(sp.isGst),
      gstin: sp.gstin || '',
      fssaiNumber: sp.fssaiNumber || '',
    };
  });

  // Include any user with seller_onboarded = true or seller_paid = true without a profile row
  for (const u of onboardedSellerUsers) {
    if (!sellerUserIds.has(u.id)) {
      sellerUserIds.add(u.id);
      const userDocs = docsByUser.get(u.id) || [];
      const app = latestAppByUser.get(u.id);
      const certifications = userDocs.map((d) => ({
        name: d.documentType || 'Uploaded Document',
        number: d.id || d.fileName,
        authority: 'Verified Upload',
        validity: d.status || 'Uploaded',
        url: d.fileUrl || null,
      }));
      if (certifications.length === 0) {
        certifications.push({
          name: 'Verified Seller Membership',
          number: u.id,
          authority: 'Ulavan Santhai Verification',
          validity: 'Active',
        });
      }

      const registeredDate = u.createdAt
        ? new Date(u.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : 'Active';

      formattedSellers.push({
        id: `USR_${u.id.replace('usr_', '').slice(0, 8).toUpperCase()}`,
        userId: u.id,
        businessName: u.name || 'Registered Cultivator',
        sellerType: 'Farmer & Cultivators',
        contactName: u.name || 'Primary Cultivator',
        phone: u.mobile || '',
        email: u.email || '',
        district: 'Tamil Nadu',
        village: '',
        pinCode: '',
        subscription: u.sellerPaid ? 'Active (₹365/Yr)' : 'Pending / Trial',
        status:
          (app?.overallStatus && APP_STATUS_TO_UI[app.overallStatus.toUpperCase()]) ||
          (u.sellerPaid ? 'Approved' : 'Pending Review'),
        address: 'Tamil Nadu',
        productsOffered: 'Direct Agricultural Harvest',
        certifications,
        registeredDate,
        isGst: false,
        gstin: '',
        fssaiNumber: '',
      });
    }
  }

  return formattedSellers;
};

/**
 * Service: Update seller profile / administrative status
 * @param {string} id
 * @param {object} updateData
 * @returns {Promise<object>}
 */
export const updateSellerService = async (id, updateData) => {
  const cleanId = String(id || '').replace(/[<>]/g, '').trim();
  const updated = await profileRepository.updateSellerById(cleanId, updateData);
  return updated;
};

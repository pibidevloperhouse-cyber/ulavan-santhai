import crypto from 'node:crypto';
import { eq, desc, and, or } from 'drizzle-orm';
import { db } from '../config/db.js';
import { buyerProfiles, sellerProfiles, users, applications, documents } from '../models/schema.js';

/**
 * Repository: Profile Data Access Layer
 * Encapsulates all database operations on 'buyer_profiles' and 'seller_profiles' tables.
 */

/**
 * Find buyer profile by user ID
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
export const findBuyerByUserId = async (userId) => {
  const [profile] = await db
    .select()
    .from(buyerProfiles)
    .where(eq(buyerProfiles.userId, userId))
    .limit(1);
  return profile || null;
};

/**
 * Upsert buyer profile (creates if not existing, updates if already present)
 * @param {string} userId
 * @param {object} buyerData
 * @returns {Promise<object>}
 */
export const upsertBuyer = async (userId, buyerData) => {
  const existing = await findBuyerByUserId(userId);
  const now = new Date();

  if (existing) {
    const [updated] = await db
      .update(buyerProfiles)
      .set({
        ...buyerData,
        updatedAt: now,
      })
      .where(eq(buyerProfiles.userId, userId))
      .returning();
    return updated;
  }

  const profileId = buyerData.id || `BP_${crypto.randomInt(100000, 999999)}`;
  const [created] = await db
    .insert(buyerProfiles)
    .values({
      id: profileId,
      userId,
      ...buyerData,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return created;
};

/**
 * Find seller profile by user ID
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
export const findSellerByUserId = async (userId) => {
  const [profile] = await db
    .select()
    .from(sellerProfiles)
    .where(eq(sellerProfiles.userId, userId))
    .limit(1);
  return profile || null;
};

/**
 * Find seller profile by user ID joined with authoritative seller_categories and membership_plans
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
export const findSellerWithCategories = async (userId) => {
  const profile = await findSellerByUserId(userId);
  if (!profile) return null;

  const rawCats = Array.isArray(profile.sellerType)
    ? profile.sellerType
    : typeof profile.sellerType === 'string'
      ? profile.sellerType.replace(/[{}]/g, '').split(',').map((s) => s.trim()).filter(Boolean)
      : [];

  let connectedCategories = [];
  if (rawCats.length > 0) {
    connectedCategories = await db
      .select({
        id: sellerCategories.id,
        code: sellerCategories.code,
        name: sellerCategories.name,
        planId: sellerCategories.planId,
        requiredDocuments: sellerCategories.requiredDocuments,
        planName: membershipPlans.name,
        priceInPaise: membershipPlans.priceInPaise,
        currency: membershipPlans.currency,
        durationDays: membershipPlans.durationDays,
      })
      .from(sellerCategories)
      .innerJoin(membershipPlans, eq(sellerCategories.planId, membershipPlans.id))
      .where(or(inArray(sellerCategories.id, rawCats), inArray(sellerCategories.code, rawCats)));
  }

  return {
    ...profile,
    connectedCategories,
  };
};

/**
 * Upsert seller profile (creates if not existing, updates if already present)
 * @param {string} userId
 * @param {object} sellerData
 * @returns {Promise<object>}
 */
export const upsertSeller = async (userId, sellerData) => {
  const existing = await findSellerByUserId(userId);
  const now = new Date();

  const { primaryProducts, capacity, ...rest } = sellerData || {};
  const normalizedSellerType = Array.isArray(rest.sellerType)
    ? rest.sellerType
    : rest.sellerType
      ? String(rest.sellerType)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      : ['Farmer'];

  const sanitizedData = {
    ...rest,
    sellerType: normalizedSellerType,
    categoryDetails: {
      ...(existing?.categoryDetails || {}),
      ...(rest.categoryDetails || {}),
      ...(primaryProducts ? { productsOffered: primaryProducts } : {}),
      ...(capacity ? { capacity } : {}),
    },
  };

  if (existing) {
    const [updated] = await db
      .update(sellerProfiles)
      .set({
        ...sanitizedData,
        updatedAt: now,
      })
      .where(eq(sellerProfiles.userId, userId))
      .returning();
    return updated;
  }

  const profileId = sanitizedData.id || `SP_${crypto.randomInt(100000, 999999)}`;
  const [created] = await db
    .insert(sellerProfiles)
    .values({
      id: profileId,
      userId,
      ...sanitizedData,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return created;
};

/**
 * Fetch all buyer profiles joined with user details (name, email, mobile from users table)
 * and seller profiles joined with user details as well.
 * @returns {Promise<{ buyers: Array<object>, sellers: Array<object> }>}
 */
export const findAllBuyersWithUserDetails = async () => {
  const buyers = await db
    .select({
      id: buyerProfiles.id,
      userId: buyerProfiles.userId,
      buyerType: buyerProfiles.buyerType,
      businessName: buyerProfiles.businessName,
      district: buyerProfiles.district,
      city: buyerProfiles.city,
      pinCode: buyerProfiles.pinCode,
      address: buyerProfiles.address,
      isGst: buyerProfiles.isGst,
      gstin: buyerProfiles.gstin,
      fssaiNumber: buyerProfiles.fssaiNumber,
      targetCommodities: buyerProfiles.targetCommodities,
      procurementVolume: buyerProfiles.procurementVolume,
      categoryDetails: buyerProfiles.categoryDetails,
      createdAt: buyerProfiles.createdAt,
      updatedAt: buyerProfiles.updatedAt,
      userName: users.name,
      userEmail: users.email,
      userMobile: users.mobile,
      userRole: users.role,
      buyerOnboarded: users.buyerOnboarded,
    })
    .from(buyerProfiles)
    .leftJoin(users, eq(buyerProfiles.userId, users.id))
    .orderBy(desc(buyerProfiles.createdAt));

  const sellers = await db
    .select({
      id: sellerProfiles.id,
      userId: sellerProfiles.userId,
      sellerType: sellerProfiles.sellerType,
      businessName: sellerProfiles.businessName,
      district: sellerProfiles.district,
      village: sellerProfiles.village,
      pinCode: sellerProfiles.pinCode,
      farmAddress: sellerProfiles.farmAddress,
      isGst: sellerProfiles.isGst,
      gstin: sellerProfiles.gstin,
      fssaiNumber: sellerProfiles.fssaiNumber,
      categoryDetails: sellerProfiles.categoryDetails,
      createdAt: sellerProfiles.createdAt,
      updatedAt: sellerProfiles.updatedAt,
      userName: users.name,
      userEmail: users.email,
      userMobile: users.mobile,
      userRole: users.role,
      buyerOnboarded: users.buyerOnboarded,
    })
    .from(sellerProfiles)
    .leftJoin(users, eq(sellerProfiles.userId, users.id))
    .orderBy(desc(sellerProfiles.createdAt));

  const onboardedBuyerUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      mobile: users.mobile,
      role: users.role,
      buyerOnboarded: users.buyerOnboarded,
      buyerPaid: users.buyerPaid,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(or(eq(users.buyerOnboarded, true), eq(users.buyerPaid, true)))
    .orderBy(desc(users.createdAt));

  return { buyers, sellers, onboardedBuyerUsers };
};

/**
 * Update buyer profile by profile ID
 * @param {string} id
 * @param {object} updateData
 * @returns {Promise<object|null>}
 */
export const updateBuyerById = async (id, updateData) => {
  const [updated] = await db
    .update(buyerProfiles)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(buyerProfiles.id, id))
    .returning();
  return updated || null;
};

/**
 * Fetch all seller profiles joined with user details (name, email, mobile from users table)
 * and latest seller applications for status & submitted certificates.
 * @returns {Promise<{ sellers: Array<object>, sellerApps: Array<object> }>}
 */
export const findAllSellersWithUserDetails = async () => {
  const sellers = await db
    .select({
      id: sellerProfiles.id,
      userId: sellerProfiles.userId,
      sellerType: sellerProfiles.sellerType,
      businessName: sellerProfiles.businessName,
      district: sellerProfiles.district,
      village: sellerProfiles.village,
      pinCode: sellerProfiles.pinCode,
      farmAddress: sellerProfiles.farmAddress,
      isGst: sellerProfiles.isGst,
      gstin: sellerProfiles.gstin,
      fssaiNumber: sellerProfiles.fssaiNumber,
      categoryDetails: sellerProfiles.categoryDetails,
      createdAt: sellerProfiles.createdAt,
      updatedAt: sellerProfiles.updatedAt,
      userName: users.name,
      userEmail: users.email,
      userMobile: users.mobile,
      userRole: users.role,
      sellerOnboarded: users.sellerOnboarded,
      sellerPaid: users.sellerPaid,
    })
    .from(sellerProfiles)
    .leftJoin(users, eq(sellerProfiles.userId, users.id))
    .orderBy(desc(sellerProfiles.createdAt));

  const sellerApps = await db
    .select({
      id: applications.id,
      userId: applications.userId,
      overallStatus: applications.overallStatus,
      documents: applications.documents,
      submittedAt: applications.submittedAt,
    })
    .from(applications)
    .where(eq(applications.role, 'SELLER'))
    .orderBy(desc(applications.submittedAt));

  const onboardedSellerUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      mobile: users.mobile,
      role: users.role,
      sellerOnboarded: users.sellerOnboarded,
      sellerPaid: users.sellerPaid,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(or(eq(users.sellerOnboarded, true), eq(users.sellerPaid, true)))
    .orderBy(desc(users.createdAt));

  const uploadedDocs = await db
    .select({
      id: documents.id,
      userId: documents.userId,
      documentType: documents.documentType,
      fileName: documents.fileName,
      fileUrl: documents.fileUrl,
      status: documents.status,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .orderBy(desc(documents.createdAt));

  return { sellers, sellerApps, onboardedSellerUsers, uploadedDocs };
};

/**
 * Update seller profile by profile ID (and optionally status in categoryDetails & application)
 * @param {string} id
 * @param {object} updateData
 * @returns {Promise<object|null>}
 */
export const updateSellerById = async (id, updateData = {}) => {
  const [existing] = await db
    .select({
      id: sellerProfiles.id,
      userId: sellerProfiles.userId,
      categoryDetails: sellerProfiles.categoryDetails,
    })
    .from(sellerProfiles)
    .where(eq(sellerProfiles.id, id))
    .limit(1);

  if (!existing) return null;

  const { status, productsOffered, address, ...profileFields } = updateData;
  const now = new Date();
  const nextDetails = {
    ...(existing.categoryDetails || {}),
    ...(profileFields.categoryDetails || {}),
  };

  if (status) {
    nextDetails.adminStatus = status;
  }
  if (productsOffered !== undefined) {
    nextDetails.productsOffered = productsOffered;
  }

  const updatePayload = {
    ...(profileFields.businessName !== undefined ? { businessName: profileFields.businessName } : {}),
    ...(profileFields.district !== undefined ? { district: profileFields.district } : {}),
    ...(profileFields.village !== undefined ? { village: profileFields.village } : {}),
    ...(profileFields.pinCode !== undefined ? { pinCode: profileFields.pinCode } : {}),
    ...(address !== undefined ? { farmAddress: address } : {}),
    ...(profileFields.farmAddress !== undefined ? { farmAddress: profileFields.farmAddress } : {}),
    ...(profileFields.sellerType !== undefined
      ? {
        sellerType: Array.isArray(profileFields.sellerType)
          ? profileFields.sellerType
          : [String(profileFields.sellerType)],
      }
      : {}),
    categoryDetails: nextDetails,
    updatedAt: now,
  };

  const [updated] = await db
    .update(sellerProfiles)
    .set(updatePayload)
    .where(eq(sellerProfiles.id, id))
    .returning({
      id: sellerProfiles.id,
      userId: sellerProfiles.userId,
      sellerType: sellerProfiles.sellerType,
      businessName: sellerProfiles.businessName,
      district: sellerProfiles.district,
      village: sellerProfiles.village,
      pinCode: sellerProfiles.pinCode,
      farmAddress: sellerProfiles.farmAddress,
      categoryDetails: sellerProfiles.categoryDetails,
      updatedAt: sellerProfiles.updatedAt,
    });

  // Also sync status to latest SELLER application if status was provided
  if (status && existing.userId) {
    const normalizedAppStatus =
      status === 'Approved'
        ? 'APPROVED'
        : status === 'Rejected'
          ? 'REJECTED'
          : status === 'Suspended'
            ? 'SUSPENDED'
            : 'PENDING_REVIEW';

    await db
      .update(applications)
      .set({ overallStatus: normalizedAppStatus, updatedAt: now })
      .where(
        and(
          eq(applications.userId, existing.userId),
          eq(applications.role, 'SELLER')
        )
      );
  }

  return updated || null;
};


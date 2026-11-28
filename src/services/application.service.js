import crypto from 'node:crypto';
import * as profileRepository from '../repositories/profile.repository.js';
import * as applicationRepository from '../repositories/application.repository.js';
import * as userRepository from '../repositories/user.repository.js';
import * as documentRepository from '../repositories/document.repository.js';
import * as sellerCategoryRepository from '../repositories/sellerCategory.repository.js';

/**
 * 8 Dynamic Seller Classification Categories
 */
export const SELLER_TYPES = Object.freeze({
  FARMER: 'Farmer',
  AGRICULTURAL_PRODUCER: 'Agricultural Producer',
  ORGANIC_PRODUCER: 'Organic Producer',
  RAW_MATERIAL_PROVIDER: 'Raw-Material Provider',
  INGREDIENT_PRODUCER: 'Ingredient Producer',
  MANUFACTURER: 'Manufacturer',
  VALUE_ADDED_MANUFACTURER: 'Value-Added Manufacturer',
  OTHER: 'Other',
});

/**
 * 7 Dynamic Buyer Classification Categories
 */
export const BUYER_TYPES = Object.freeze({
  INDIVIDUAL: 'Individual',
  BUSINESS: 'Business',
  MANUFACTURER: 'Manufacturer',
  FOOD_PROCESSOR: 'Food Processor',
  BAKERY_OR_FOOD_BUSINESS: 'Bakery or Food Business',
  RESELLER: 'Reseller',
  OTHER: 'Other',
});

/**
 * Resolves category input (array or string) to master category IDs dynamically from public.seller_categories table
 * @param {Array|string} input
 * @param {Array<object>} [cachedCategories]
 * @returns {Promise<Array<string>>}
 */
export const resolveCategoryIds = async (input, cachedCategories = null) => {
  const activeCategories = Array.isArray(cachedCategories) && cachedCategories.length > 0
    ? cachedCategories
    : await sellerCategoryRepository.findAllActiveWithPlans();

  if (!input) {
    return activeCategories.length > 0 ? [activeCategories[0].id] : [];
  }

  let rawList = [];
  if (Array.isArray(input)) {
    rawList = input;
  } else if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      rawList = trimmed.slice(1, -1).split(',').map((s) => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
    } else {
      rawList = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }

  const ids = [];
  for (const item of rawList) {
    const clean = String(item).trim().toLowerCase();
    if (!clean) continue;

    // 1. Direct match by id in seller_categories (e.g. 'CAT-SEL-01')
    const matchById = activeCategories.find((cat) => String(cat.id).trim().toLowerCase() === clean);
    if (matchById) {
      ids.push(matchById.id);
      continue;
    }

    // 2. Match by code in seller_categories (e.g. 'Farmer', 'Agricultural Producer')
    const matchByCode = activeCategories.find((cat) => String(cat.code).trim().toLowerCase() === clean);
    if (matchByCode) {
      ids.push(matchByCode.id);
      continue;
    }

    // 3. Match by name in seller_categories (e.g. 'Farmer & Agricultural Cultivators')
    const matchByName = activeCategories.find((cat) => String(cat.name).trim().toLowerCase() === clean);
    if (matchByName) {
      ids.push(matchByName.id);
      continue;
    }

    if (/^CAT-SEL-\d+$/i.test(item.trim())) {
      ids.push(item.trim().toUpperCase());
    }
  }

  const unique = [...new Set(ids)];
  return unique.length > 0
    ? unique
    : (activeCategories.length > 0 ? [activeCategories[0].id] : []);
};

/**
 * Extracts form data for a specific category code from the submitted profile payload
 * @param {string} code
 * @param {object} profile
 * @returns {object}
 */
export const extractCategoryDataForCode = (code, profile = {}) => {
  const norm = String(code || '').trim().toLowerCase();
  const data = {};

  if (norm === 'farmer') {
    const farmerFarmName = profile.farmerFarmName?.trim() || profile.farmName?.trim() || null;
    if (farmerFarmName) data.farmerFarmName = farmerFarmName;
  } else if (norm === 'agricultural producer') {
    const fpoName = profile.fpoName?.trim() || null;
    const fpoStructure = profile.fpoStructure || 'Farmer Producer Company (FPC)';
    const fpoIsRegistered = profile.fpoIsRegistered || 'No';
    const fpoRegNumber = fpoIsRegistered === 'Yes' ? profile.fpoRegNumber?.trim() || null : null;
    if (fpoName || fpoRegNumber) {
      data.fpoName = fpoName;
      data.fpoStructure = fpoStructure;
      data.fpoIsRegistered = fpoIsRegistered;
      if (fpoRegNumber) data.fpoRegNumber = fpoRegNumber;
    }
  } else if (norm === 'organic producer') {
    const organicFarmName = profile.organicFarmName?.trim() || null;
    const organicCertStatus = profile.organicCertStatus || 'Certified Organic (NPOP)';
    const organicHasLicense = profile.organicHasLicense || 'No';
    const organicScopeNumber = organicHasLicense === 'Yes' ? profile.organicScopeNumber?.trim() || null : null;
    if (organicFarmName || organicScopeNumber) {
      data.organicFarmName = organicFarmName;
      data.organicCertStatus = organicCertStatus;
      data.organicHasLicense = organicHasLicense;
      if (organicScopeNumber) data.organicScopeNumber = organicScopeNumber;
    }
  } else if (norm === 'raw-material provider') {
    const rawProviderName = profile.rawProviderName?.trim() || null;
    if (rawProviderName) data.rawProviderName = rawProviderName;
  } else if (norm === 'ingredient producer') {
    const ingProducerName = profile.ingProducerName?.trim() || null;
    const ingHasFssai = profile.ingHasFssai || 'No';
    const ingFssaiNumber = ingHasFssai === 'Yes' ? profile.ingFssaiNumber?.trim() || null : null;
    if (ingProducerName) {
      data.ingProducerName = ingProducerName;
      data.ingHasFssai = ingHasFssai;
      if (ingFssaiNumber) data.ingFssaiNumber = ingFssaiNumber;
    }
  } else if (norm === 'manufacturer') {
    const mfgSellerName = profile.mfgSellerName?.trim() || null;
    const mfgHasFssai = profile.mfgHasFssai || 'No';
    const mfgFssaiNumber = mfgHasFssai === 'Yes' ? profile.mfgFssaiNumber?.trim() || null : null;
    const mfgIsGst = profile.mfgIsGst || 'No';
    const mfgGstin = mfgIsGst === 'Yes' ? profile.mfgGstin?.trim() || null : null;
    if (mfgSellerName) {
      data.mfgSellerName = mfgSellerName;
      data.mfgHasFssai = mfgHasFssai;
      if (mfgFssaiNumber) data.mfgFssaiNumber = mfgFssaiNumber;
      data.mfgIsGst = mfgIsGst;
      if (mfgGstin) data.mfgGstin = mfgGstin;
    }
  } else if (norm === 'value-added manufacturer') {
    const vaBrandName = profile.vaBrandName?.trim() || null;
    const vaHasFssai = profile.vaHasFssai || 'No';
    const vaFssaiNumber = vaHasFssai === 'Yes' ? profile.vaFssaiNumber?.trim() || null : null;
    if (vaBrandName) {
      data.vaBrandName = vaBrandName;
      data.vaHasFssai = vaHasFssai;
      if (vaFssaiNumber) data.vaFssaiNumber = vaFssaiNumber;
    }
  } else if (norm === 'other') {
    const otherSellerName = profile.otherSellerName?.trim() || profile.businessName?.trim() || null;
    const otherActivity = profile.otherActivity?.trim() || null;
    const otherIsGst = profile.otherIsGst || 'No';
    const otherGstin = otherIsGst === 'Yes' ? profile.otherGstin?.trim() || null : null;
    if (otherSellerName || otherActivity) {
      if (otherSellerName) data.otherSellerName = otherSellerName;
      if (otherActivity) data.otherActivity = otherActivity;
      data.otherIsGst = otherIsGst;
      if (otherGstin) data.otherGstin = otherGstin;
    }
  }

  // Also support category details pre-keyed by code in profile payload
  if (profile[code] && typeof profile[code] === 'object') {
    Object.assign(data, profile[code]);
  }
  if (profile.categoryDetails?.[code] && typeof profile.categoryDetails[code] === 'object') {
    Object.assign(data, profile.categoryDetails[code]);
  }

  return data;
};

/**
 * Helper: Extract unified search attributes and category-specific details
 * across all dynamic seller classifications with zero data loss.
 * Fetches category metadata dynamically from public.seller_categories in Supabase.
 * @param {string|Array} subType
 * @param {object} profile
 * @param {Array<object>} [cachedCategories]
 * @returns {Promise<object>}
 */
export const extractSellerProfile = async (subType, profile = {}, cachedCategories = null) => {
  const activeCategories = Array.isArray(cachedCategories) && cachedCategories.length > 0
    ? cachedCategories
    : await sellerCategoryRepository.findAllActiveWithPlans();

  const rawCategoryInput =
    profile.categoryIds ||
    profile.selectedCategories ||
    subType ||
    profile.sellerType ||
    'Farmer';
  const categoryIds = await resolveCategoryIds(rawCategoryInput, activeCategories);
  const primarySellerType = String(subType || profile.sellerType || 'Farmer').trim();

  // Common location fields
  const district = profile.district ? String(profile.district).trim() : null;
  const village = profile.village ? String(profile.village).trim() : null;
  const pinCode = profile.pinCode || profile.pincode ? String(profile.pinCode || profile.pincode).trim() : null;
  const farmAddress = profile.farmAddress || profile.address ? String(profile.farmAddress || profile.address).trim() : null;

  // Extract category data dynamically by looping directly through active categories from the database
  const categoryDetails = {};

  for (const category of activeCategories) {
    // Only package categories that the seller selected in categoryIds
    if (!categoryIds.includes(category.id)) {
      continue;
    }

    const catData = extractCategoryDataForCode(category.code, profile);
    if (catData && Object.keys(catData).length > 0) {
      categoryDetails[category.id] = {
        categoryId: category.id,
        ...catData,
      };
    }
  }

  // Derive unified businessName from profile or the first matching category details
  let businessName = profile.businessName?.trim() || profile.farmName?.trim() || '';
  if (!businessName) {
    for (const catId of categoryIds) {
      const details = categoryDetails[catId];
      if (details) {
        businessName =
          details.farmerFarmName ||
          details.fpoName ||
          details.organicFarmName ||
          details.rawProviderName ||
          details.ingProducerName ||
          details.mfgSellerName ||
          details.vaBrandName ||
          details.otherSellerName ||
          '';
        if (businessName) break;
      }
    }
  }
  if (!businessName) businessName = 'Agri Enterprise';

  // Derive compliance flags across all selected categories
  let isGst = false;
  let gstin = null;
  let fssaiNumber = null;

  for (const details of Object.values(categoryDetails)) {
    if (details.mfgIsGst === 'Yes' || details.otherIsGst === 'Yes') isGst = true;
    if (details.mfgGstin) gstin = details.mfgGstin;
    if (details.otherGstin && !gstin) gstin = details.otherGstin;
    if (details.ingFssaiNumber) fssaiNumber = details.ingFssaiNumber;
    if (details.mfgFssaiNumber && !fssaiNumber) fssaiNumber = details.mfgFssaiNumber;
    if (details.vaFssaiNumber && !fssaiNumber) fssaiNumber = details.vaFssaiNumber;
  }

  if (primaryProducts) {
    categoryDetails.productsOffered = primaryProducts;
  }
  if (capacity) {
    categoryDetails.capacity = capacity;
  }

  return {
    sellerType: categoryIds,
    businessName,
    district: district || 'Not specified',
    village,
    pinCode,
    farmAddress,
    isGst,
    gstin,
    fssaiNumber,
    categoryDetails,
  };
};

/**
 * Helper: Extract unified search attributes and category-specific details
 * across all 7 dynamic buyer classifications with zero data loss.
 * @param {string} subType
 * @param {object} profile
 * @returns {object}
 */
export const extractBuyerProfile = (subType, profile = {}) => {
  const buyerType = String(subType || profile.buyerType || BUYER_TYPES.INDIVIDUAL).trim();

  const district = profile.district || null;
  const city = profile.city || null;
  const pinCode = profile.pinCode || profile.pincode || null;
  const address = profile.address || null;

  let businessName = '';
  let targetCommodities = '';
  let procurementVolume = '';
  let isGst = false;
  let gstin = null;
  let fssaiNumber = null;
  const categoryDetails = {};

  switch (buyerType) {
    case BUYER_TYPES.INDIVIDUAL: {
      businessName = profile.userName || profile.name || profile.businessName || 'Individual Household Buyer';
      const comms = Array.isArray(profile.individualCommodities)
        ? profile.individualCommodities
        : (profile.commodities || []);
      targetCommodities = comms.join(', ');
      procurementVolume = profile.individualVolume || profile.volume || null;
      isGst = false;
      gstin = null;
      fssaiNumber = null;

      categoryDetails.individualCommodities = comms;
      categoryDetails.individualVolume = profile.individualVolume || null;
      categoryDetails.individualFrequency = profile.individualFrequency || null;
      categoryDetails.individualPayment = profile.individualPayment || null;
      break;
    }

    case BUYER_TYPES.BUSINESS: {
      businessName = profile.businessName || 'Commercial Agro Business';
      const comms = Array.isArray(profile.businessCommodities)
        ? profile.businessCommodities
        : (profile.commodities || []);
      targetCommodities = comms.join(', ');
      procurementVolume = profile.businessVolume || profile.volume || null;
      isGst = profile.businessIsGst === 'Yes' || Boolean(profile.isGst);
      gstin = profile.businessGstin || profile.gstin || null;
      fssaiNumber = null;

      categoryDetails.businessName = profile.businessName || null;
      categoryDetails.businessConstitution = profile.businessConstitution || profile.constitution || null;
      categoryDetails.businessDesignation = profile.businessDesignation || profile.designation || null;
      categoryDetails.businessCommodities = comms;
      categoryDetails.businessVolume = profile.businessVolume || null;
      categoryDetails.businessPaymentTerms = profile.businessPaymentTerms || profile.paymentTerms || null;
      categoryDetails.businessIsGst = profile.businessIsGst || (isGst ? 'Yes' : 'No');
      categoryDetails.businessGstin = gstin;
      break;
    }

    case BUYER_TYPES.MANUFACTURER: {
      businessName = profile.mfgCompanyName || profile.companyName || profile.businessName || 'Industrial Agro Manufacturer';
      targetCommodities = profile.mfgRawMaterials || profile.rawMaterials || '';
      procurementVolume = profile.mfgVolume || profile.volume || null;
      isGst = profile.mfgIsGst === 'Yes' || Boolean(profile.isGst);
      gstin = profile.mfgGstin || profile.gstin || null;
      fssaiNumber = null;

      categoryDetails.mfgCompanyName = profile.mfgCompanyName || null;
      categoryDetails.mfgConstitution = profile.mfgConstitution || profile.constitution || null;
      categoryDetails.mfgDesignation = profile.mfgDesignation || profile.designation || null;
      categoryDetails.mfgCategory = profile.mfgCategory || null;
      categoryDetails.mfgRawMaterials = profile.mfgRawMaterials || null;
      categoryDetails.mfgVolume = profile.mfgVolume || null;
      categoryDetails.mfgPaymentTerms = profile.mfgPaymentTerms || profile.paymentTerms || null;
      categoryDetails.mfgIsGst = profile.mfgIsGst || (isGst ? 'Yes' : 'No');
      categoryDetails.mfgGstin = gstin;
      break;
    }

    case BUYER_TYPES.FOOD_PROCESSOR: {
      businessName = profile.procBusinessName || profile.businessName || 'Agro Food Processor';
      targetCommodities = profile.procRawCommodities || profile.rawMaterials || '';
      procurementVolume = profile.procCapacity || profile.capacity || null;
      isGst = profile.procIsGst === 'Yes' || Boolean(profile.isGst);
      gstin = profile.procGstin || profile.gstin || null;
      fssaiNumber = profile.procFssaiNumber || profile.fssaiNumber || null;

      categoryDetails.procBusinessName = profile.procBusinessName || null;
      categoryDetails.procActivity = profile.procActivity || profile.activity || null;
      categoryDetails.procRawCommodities = profile.procRawCommodities || null;
      categoryDetails.procCapacity = profile.procCapacity || null;
      categoryDetails.procFssaiNumber = fssaiNumber;
      categoryDetails.procPaymentTerms = profile.procPaymentTerms || profile.paymentTerms || null;
      categoryDetails.procIsGst = profile.procIsGst || (isGst ? 'Yes' : 'No');
      categoryDetails.procGstin = gstin;
      break;
    }

    case BUYER_TYPES.BAKERY_OR_FOOD_BUSINESS: {
      businessName = profile.bakeryName || profile.businessName || 'Commercial Bakery & Food Business';
      targetCommodities = profile.bakeryIngredients || '';
      procurementVolume = profile.bakeryFrequency || null;
      isGst = profile.bakeryIsGst === 'Yes' || Boolean(profile.isGst);
      gstin = profile.bakeryGstin || profile.gstin || null;
      fssaiNumber = profile.bakeryFssaiNumber || profile.fssaiNumber || null;

      categoryDetails.bakeryName = profile.bakeryName || null;
      categoryDetails.bakeryType = profile.bakeryType || null;
      categoryDetails.bakeryDesignation = profile.bakeryDesignation || null;
      categoryDetails.bakeryIngredients = profile.bakeryIngredients || null;
      categoryDetails.bakeryFrequency = profile.bakeryFrequency || null;
      categoryDetails.bakeryFssaiNumber = fssaiNumber;
      categoryDetails.bakeryIsGst = profile.bakeryIsGst || (isGst ? 'Yes' : 'No');
      categoryDetails.bakeryGstin = gstin;
      break;
    }

    case BUYER_TYPES.RESELLER: {
      businessName = profile.resellerShopName || profile.shopName || profile.businessName || 'Wholesale Mandi Merchant';
      const comms = Array.isArray(profile.resellerCategories)
        ? profile.resellerCategories
        : (profile.commodities || []);
      targetCommodities = comms.join(', ');
      procurementVolume = profile.resellerDailyVolume || profile.volume || null;
      isGst = profile.resellerIsGst === 'Yes' || Boolean(profile.isGst);
      gstin = profile.resellerGstin || profile.gstin || null;
      fssaiNumber = null;

      categoryDetails.resellerShopName = profile.resellerShopName || null;
      categoryDetails.resellerType = profile.resellerType || null;
      categoryDetails.resellerCategories = comms;
      categoryDetails.resellerDailyVolume = profile.resellerDailyVolume || null;
      categoryDetails.resellerPaymentPreference = profile.resellerPaymentPreference || null;
      categoryDetails.resellerIsGst = profile.resellerIsGst || (isGst ? 'Yes' : 'No');
      categoryDetails.resellerGstin = gstin;
      break;
    }

    case BUYER_TYPES.OTHER:
    default: {
      businessName = profile.otherOrgName || profile.businessName || 'Institutional Food Buyer';
      targetCommodities = profile.otherItemsNeeded || '';
      procurementVolume = null;
      isGst = profile.otherIsGst === 'Yes' || Boolean(profile.isGst);
      gstin = profile.otherGstin || profile.gstin || null;
      fssaiNumber = profile.fssaiNumber || null;

      categoryDetails.otherOrgName = profile.otherOrgName || null;
      categoryDetails.otherCategory = profile.otherCategory || null;
      categoryDetails.otherPurpose = profile.otherPurpose || null;
      categoryDetails.otherItemsNeeded = profile.otherItemsNeeded || null;
      categoryDetails.otherIsGst = profile.otherIsGst || (isGst ? 'Yes' : 'No');
      categoryDetails.otherGstin = gstin;
      break;
    }
  }

  return {
    buyerType,
    businessName: businessName || 'Agri Buyer',
    district: district || 'Not specified',
    city,
    pinCode,
    address,
    isGst,
    gstin,
    fssaiNumber,
    targetCommodities: targetCommodities || null,
    procurementVolume: procurementVolume || null,
    categoryDetails,
  };
};

/**
 * Service: Submit Onboarding Application (Buyer & Seller)
 * @param {object} input
 * @returns {Promise<object>}
 */
export const submitApplicationService = async ({
  applicationId,
  role,
  subType,
  profile = {},
  documents = {},
  account = {},
  user,
  userId: directUserId,
} = {}) => {
  const userId = user?.id || directUserId;

  if (!userId) {
    const error = new Error('User authentication required. Unverified credentials rejected.');
    error.statusCode = 401;
    throw error;
  }

  const normalizedRole = String(role || account?.activeRole || 'BUYER').trim().toUpperCase();
  const cleanSubType = String(
    subType || (normalizedRole === 'BUYER' ? BUYER_TYPES.INDIVIDUAL : SELLER_TYPES.FARMER)
  )
    .trim()
    .slice(0, 255);
  const finalAppId = String(applicationId || `US_${normalizedRole}_${crypto.randomInt(100000, 999999)}`).trim();
  const now = new Date();

  // 1. Persist Profile
  if (normalizedRole === 'BUYER') {
    const buyerData = extractBuyerProfile(cleanSubType, profile);
    await profileRepository.upsertBuyer(userId, buyerData);
    await userRepository.updateBuyerOnboarding(userId);
    console.log(`[APPLICATION] Buyer profile & onboarding updated for user: ${userId}`);
  } else {
    // SELLER
    const sellerData = await extractSellerProfile(cleanSubType, profile);
    await profileRepository.upsertSeller(userId, sellerData);
    await userRepository.updateSellerOnboarding(userId);
    console.log(`[APPLICATION] Seller profile & onboarding updated for user: ${userId}`);
  }

  // 2. Persist Application Record with Full Profile Payload Snapshot
  const savedApp = await applicationRepository.upsert(finalAppId, {
    userId,
    role: normalizedRole,
    subType: cleanSubType,
    profilePayload: profile,
    documents,
    overallStatus: 'PENDING_REVIEW',
    adminComments: 'Application received and queued for review.',
    submittedAt: now,
    updatedAt: now,
  });

  return {
    success: true,
    message: 'Application submitted successfully.',
    applicationId: finalAppId,
    data: {
      applicationId: finalAppId,
      role: normalizedRole,
      subType: cleanSubType,
      overallStatus: 'PENDING_REVIEW',
      submittedAt: savedApp.submittedAt,
    },
  };
};

/**
 * Service: Check Application Status
 * @param {object} input
 * @returns {Promise<object>}
 */
export const getApplicationStatusService = async ({ applicationId, user } = {}) => {
  let app = null;

  if (applicationId) {
    app = await applicationRepository.findById(applicationId);
  }

  const userId = user?.id;
  if (!app && userId) {
    app = await applicationRepository.findLatestByUserId(userId);
  }

  if (app) {
    // Enrich with live documents from the documents table for admin/user verification
    const verifiedDocuments = await documentRepository.findByUserId(app.userId);
    return {
      success: true,
      application: {
        ...app,
        verifiedDocuments: verifiedDocuments || [],
      },
    };
  }

  return {
    success: true,
    application: null,
    message: 'No active application found.',
  };
};

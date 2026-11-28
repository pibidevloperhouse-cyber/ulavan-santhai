"use client";

import { useState, useEffect, useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/services/apiConfig";
import { getSellerCategories } from "@/services/categoryStorage";
import {
  getDynamicSellerProfile,
  getSellerProfile,
  getSellerUnlockedCategories,
  updateSellerProfile,
} from "@/services/sellerApi";
import { fetchCurrentUserProfile } from "@/services/paymentApi";

export const TAMIL_NADU_DISTRICTS = [
  "Ariyalur",
  "Chengalpattu",
  "Chennai",
  "Coimbatore",
  "Cuddalore",
  "Dharmapuri",
  "Dindigul",
  "Erode",
  "Kallakurichi",
  "Kanchipuram",
  "Kanyakumari",
  "Karur",
  "Krishnagiri",
  "Madurai",
  "Mayiladuthurai",
  "Nagapattinam",
  "Namakkal",
  "Nilgiris",
  "Perambalur",
  "Pudukkottai",
  "Ramanathapuram",
  "Ranipet",
  "Salem",
  "Sivaganga",
  "Tenkasi",
  "Thanjavur",
  "Theni",
  "Thoothukudi",
  "Tiruchirappalli",
  "Tirunelveli",
  "Tirupathur",
  "Tiruppur",
  "Tiruvallur",
  "Tiruvannamalai",
  "Tiruvarur",
  "Vellore",
  "Viluppuram",
  "Virudhunagar",
];

export const FPO_STRUCTURE_OPTIONS = [
  "Farmer Producer Company (FPC)",
  "Registered Cooperative Society",
  "Joint Liability Group (JLG)",
  "Self Help Group (SHG)",
];

export const ORGANIC_CERT_STATUS_OPTIONS = [
  "Certified Organic (NPOP)",
  "In-Conversion (C1 / C2)",
  "PGS-India Green / Organic",
  "Natural Farming (Uncertified)",
];

export const SELLER_DOCUMENT_LABELS = {
  LAND_PROOF: {
    title: "Patta / Chitta Document",
    description: "Official land record for farm cultivation verification.",
  },
  FPO_CERTIFICATE: {
    title: "FPO / Cooperative Registration Certificate",
    description: "Certificate of Incorporation or Society Registration proof.",
  },
  ORGANIC_CERTIFICATE: {
    title: "Organic Certification Document (NPOP / PGS-India)",
    description: "Valid NPOP scope or PGS-India organic certification.",
  },
  ID_PROOF: {
    title: "Government Identity Proof / PAN Card",
    description: "Valid Business PAN Card or Owner Identity Proof.",
  },
  BANK_PASSBOOK: {
    title: "Bank Account Passbook / Cancelled Cheque",
    description: "Direct farm-gate settlement proof.",
  },
  FSSAI_LICENSE: {
    title: "FSSAI Food Safety License Certificate",
    description: "State or Central FSSAI registration certificate.",
  },
  GST_CERTIFICATE: {
    title: "GST Registration Certificate (Form REG-06)",
    description: "Business GST registration certificate.",
  },
  BUSINESS_CERTIFICATE: {
    title: "Additional Business Certification",
    description: "Supporting farm, trade, or quality certification.",
  },
};

const STANDARD_SELLER_TYPES = [
  "Farmer",
  "Agricultural Producer",
  "Organic Producer",
  "Raw-Material Provider",
  "Ingredient Producer",
  "Manufacturer",
  "Value-Added Manufacturer",
  "Other",
];

export function getRequiredSellerDocumentTypes(sellerTypes = [], sellerData = {}) {
  const types = Array.isArray(sellerTypes) ? sellerTypes : [];
  const hasRole = (name) => types.includes(name);
  const customTypes = types.filter((t) => !STANDARD_SELLER_TYPES.includes(t));
  const docKeys = new Set();

  if (hasRole("Farmer")) docKeys.add("LAND_PROOF");
  if (hasRole("Agricultural Producer")) docKeys.add("FPO_CERTIFICATE");
  if (hasRole("Organic Producer")) docKeys.add("ORGANIC_CERTIFICATE");
  if (hasRole("Other") || customTypes.length > 0) docKeys.add("ID_PROOF");
  if (customTypes.length > 0) docKeys.add("BANK_PASSBOOK");

  if (
    (hasRole("Ingredient Producer") && sellerData?.ingHasFssai === "Yes") ||
    hasRole("Manufacturer") ||
    hasRole("Value-Added Manufacturer")
  ) {
    docKeys.add("FSSAI_LICENSE");
  }

  if (
    hasRole("Raw-Material Provider") ||
    hasRole("Ingredient Producer") ||
    hasRole("Manufacturer") ||
    hasRole("Other") ||
    (customTypes.length > 0 && sellerData?.otherIsGst === "Yes") ||
    (hasRole("Agricultural Producer") && sellerData?.fpoIsGst === "Yes")
  ) {
    docKeys.add("GST_CERTIFICATE");
  }

  return Array.from(docKeys);
}

/**
 * Changes authenticated user password via backend auth/user endpoints.
 * Falls back to alternate routes only when the endpoint returns 404/405.
 */
export async function changeAccountPassword({
  currentPassword,
  newPassword,
  confirmPassword,
}) {
  const body = JSON.stringify({
    currentPassword,
    newPassword,
    confirmPassword,
  });

  const attempts = [
    ["/api/auth/change-password", "POST"],
    ["/api/user/change-password", "POST"],
    ["/api/user/change-password", "PUT"],
    ["/api/auth/change-password", "PUT"],
    ["/api/v1/seller/change-password", "POST"],
  ];

  let lastRes = null;
  for (const [endpoint, method] of attempts) {
    const res = await apiFetch(endpoint, { method, body });
    lastRes = res;
    if (res.success) return res;
    if (res.status !== 404 && res.status !== 405) return res;
  }

  return (
    lastRes || {
      success: false,
      status: 404,
      error: "Password change endpoint is unavailable on the server.",
    }
  );
}

const subscribeRawSession = (callback) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("ulavan_session_updated", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("ulavan_session_updated", callback);
  };
};

function getRawSessionSnapshot() {
  if (typeof window === "undefined") return "{}";
  return sessionStorage.getItem("ulavan_user") || "{}";
}

function getRawServerSnapshot() {
  return "{}";
}

function useFullSessionUser() {
  const rawJson = useSyncExternalStore(
    subscribeRawSession,
    getRawSessionSnapshot,
    getRawServerSnapshot
  );

  try {
    return JSON.parse(rawJson) || {};
  } catch {
    return {};
  }
}

function updateSessionUserStorage(patchOrUpdater) {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("ulavan_user");
    const existing = raw ? JSON.parse(raw) : {};
    const next =
      typeof patchOrUpdater === "function"
        ? patchOrUpdater(existing)
        : { ...existing, ...patchOrUpdater };
    sessionStorage.setItem("ulavan_user", JSON.stringify(next));
    window.dispatchEvent(new Event("ulavan_session_updated"));
    return next;
  } catch {
    return null;
  }
}

function normalizeDocumentsMap(sources = []) {
  const result = {};

  const putDoc = (docTypeHint, rawDoc) => {
    if (!rawDoc || typeof rawDoc !== "object") return;
    const docType = String(
      rawDoc.documentType || rawDoc.type || docTypeHint || ""
    ).trim();
    const key = docType || `DOC_${Object.keys(result).length + 1}`;
    const fileName =
      rawDoc.fileName ||
      rawDoc.filename ||
      rawDoc.name ||
      rawDoc.originalName ||
      (rawDoc.url ? String(rawDoc.url).split("/").pop().split("?")[0] : "") ||
      SELLER_DOCUMENT_LABELS[key]?.title ||
      key;

    result[key] = {
      documentId: rawDoc.documentId || rawDoc.id || rawDoc._id || "",
      documentType: key,
      fileName,
      fileSize: Number(rawDoc.fileSize || rawDoc.size || 0),
      url: rawDoc.url || rawDoc.fileUrl || rawDoc.previewUrl || "",
      status: rawDoc.status || "Uploaded",
      uploadedAt: rawDoc.uploadedAt || rawDoc.createdAt || "",
    };
  };

  for (const src of sources) {
    if (!src) continue;
    if (Array.isArray(src)) {
      src.forEach((item, idx) =>
        putDoc(item?.documentType || `DOC_${idx + 1}`, item)
      );
    } else if (typeof src === "object") {
      Object.entries(src).forEach(([k, val]) => {
        if (
          val &&
          typeof val === "object" &&
          !val.fileName &&
          !val.url &&
          !val.documentType
        ) {
          Object.entries(val).forEach(([nestedKey, nestedDoc]) => {
            putDoc(nestedKey, nestedDoc);
          });
        } else {
          putDoc(k, val);
        }
      });
    }
  }

  return result;
}

function normalizeClassificationKey(str) {
  return String(str || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function resolveRichSellerTypes(userObj, sellerData) {
  const fromBase = getSellerUnlockedCategories(userObj);
  if (fromBase.length > 0) return fromBase;

  const tokens = [];
  const pushToken = (val) => {
    if (!val) return;
    if (Array.isArray(val)) val.forEach(pushToken);
    else if (typeof val === "string") {
      val
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
        .forEach((p) => tokens.push(p));
    }
  };

  pushToken(sellerData.unlockedCategories);
  pushToken(sellerData.sellerTypes);
  pushToken(sellerData.selectedSellerTypes);
  pushToken(userObj?.application?.selectedSellerTypes);
  pushToken(sellerData.sellerType || sellerData.seller_type);
  pushToken(userObj?.sellerType || userObj?.seller_type);
  pushToken(userObj?.sub_type || userObj?.application?.subType);

  if (tokens.length === 0) {
    if (sellerData.farmerFarmName || sellerData.farmer_farm_name) tokens.push("Farmer");
    if (sellerData.fpoName || sellerData.fpo_name) tokens.push("Agricultural Producer");
    if (sellerData.organicFarmName || sellerData.organic_farm_name) tokens.push("Organic Producer");
    if (sellerData.rawProviderName || sellerData.raw_provider_name) tokens.push("Raw-Material Provider");
    if (sellerData.ingProducerName || sellerData.ing_producer_name) tokens.push("Ingredient Producer");
    if (sellerData.mfgSellerName || sellerData.mfg_seller_name) tokens.push("Manufacturer");
    if (sellerData.vaBrandName || sellerData.va_brand_name) tokens.push("Value-Added Manufacturer");
    if (sellerData.otherSellerName || sellerData.other_seller_name) tokens.push("Other");
  }

  const availableCats = getSellerCategories();
  const resolved = new Set();
  for (const token of tokens) {
    const norm = normalizeClassificationKey(token);
    if (!norm || norm === "seller" || norm === "buyer") continue;
    const matched = availableCats.find((c) => {
      const codeNorm = normalizeClassificationKey(c.code || c.name);
      const nameNorm = normalizeClassificationKey(c.name);
      const idNorm = normalizeClassificationKey(c.id);
      return norm === codeNorm || norm === nameNorm || norm === idNorm;
    });
    resolved.add(matched ? matched.code || matched.name : token);
  }
  return Array.from(resolved);
}

function deriveRichSellerProfile(userObj) {
  const base = getDynamicSellerProfile(userObj);
  if (!userObj || Object.keys(userObj).length === 0) {
    return {
      ...base,
      accountName: "",
      farmAddress: "",
      district: "",
      village: "",
      farmerFarmName: "",
      fpoName: "",
      fpoStructure: "Farmer Producer Company (FPC)",
      fpoIsRegistered: "No",
      fpoRegNumber: "",
      organicFarmName: "",
      organicCertStatus: "Certified Organic (NPOP)",
      organicHasLicense: "No",
      organicScopeNumber: "",
      rawProviderName: "",
      ingProducerName: "",
      ingHasFssai: "No",
      ingFssaiNumber: "",
      mfgSellerName: "",
      mfgHasFssai: "No",
      mfgFssaiNumber: "",
      mfgIsGst: "No",
      mfgGstin: "",
      vaBrandName: "",
      vaHasFssai: "No",
      vaFssaiNumber: "",
      otherSellerName: "",
      otherActivity: "",
      otherIsGst: "No",
      otherGstin: "",
      documents: {},
      emailVerified: true,
      preferences: {
        showPhoneToBuyers: true,
        showEmailToBuyers: true,
        enquiryDigest: true,
        preferredLanguage: "English",
      },
    };
  }

  const rawSellerData = {
    ...(typeof userObj.profile === "object" ? userObj.profile : {}),
    ...(typeof userObj.application?.profile === "object"
      ? userObj.application.profile
      : {}),
    ...(userObj.sellerData ||
      userObj.sellerProfile ||
      userObj.onboarding ||
      {}),
  };

  const sellerData = {
    ...rawSellerData,
    businessName: rawSellerData.businessName || rawSellerData.business_name || "",
    farmerFarmName: rawSellerData.farmerFarmName || rawSellerData.farmer_farm_name || "",
    fpoName: rawSellerData.fpoName || rawSellerData.fpo_name || "",
    fpoStructure: rawSellerData.fpoStructure || rawSellerData.fpo_structure || "",
    fpoIsRegistered: rawSellerData.fpoIsRegistered || rawSellerData.fpo_is_registered || "",
    fpoRegNumber: rawSellerData.fpoRegNumber || rawSellerData.fpo_reg_number || "",
    organicFarmName: rawSellerData.organicFarmName || rawSellerData.organic_farm_name || "",
    organicCertStatus: rawSellerData.organicCertStatus || rawSellerData.organic_cert_status || "",
    organicHasLicense: rawSellerData.organicHasLicense || rawSellerData.organic_has_license || "",
    organicScopeNumber: rawSellerData.organicScopeNumber || rawSellerData.organic_scope_number || "",
    rawProviderName: rawSellerData.rawProviderName || rawSellerData.raw_provider_name || "",
    ingProducerName: rawSellerData.ingProducerName || rawSellerData.ing_producer_name || "",
    ingHasFssai: rawSellerData.ingHasFssai || rawSellerData.ing_has_fssai || "",
    ingFssaiNumber: rawSellerData.ingFssaiNumber || rawSellerData.ing_fssai_number || "",
    mfgSellerName: rawSellerData.mfgSellerName || rawSellerData.mfg_seller_name || "",
    mfgHasFssai: rawSellerData.mfgHasFssai || rawSellerData.mfg_has_fssai || "",
    mfgFssaiNumber: rawSellerData.mfgFssaiNumber || rawSellerData.mfg_fssai_number || "",
    mfgIsGst: rawSellerData.mfgIsGst || rawSellerData.mfg_is_gst || "",
    mfgGstin: rawSellerData.mfgGstin || rawSellerData.mfg_gstin || "",
    vaBrandName: rawSellerData.vaBrandName || rawSellerData.va_brand_name || "",
    vaHasFssai: rawSellerData.vaHasFssai || rawSellerData.va_has_fssai || "",
    vaFssaiNumber: rawSellerData.vaFssaiNumber || rawSellerData.va_fssai_number || "",
    otherSellerName: rawSellerData.otherSellerName || rawSellerData.other_seller_name || "",
    otherActivity: rawSellerData.otherActivity || rawSellerData.other_activity || "",
    otherIsGst: rawSellerData.otherIsGst || rawSellerData.other_is_gst || "",
    otherGstin: rawSellerData.otherGstin || rawSellerData.other_gstin || "",
    farmAddress:
      rawSellerData.farmAddress ||
      rawSellerData.farm_address ||
      rawSellerData.address ||
      "",
    district: rawSellerData.district || "",
    village: rawSellerData.village || rawSellerData.taluk || "",
    pinCode:
      rawSellerData.pinCode ||
      rawSellerData.pin_code ||
      rawSellerData.pincode ||
      "",
  };

  const resolvedTypes = resolveRichSellerTypes(userObj, sellerData);
  const businessName =
    sellerData.farmerFarmName ||
    sellerData.fpoName ||
    sellerData.organicFarmName ||
    sellerData.rawProviderName ||
    sellerData.ingProducerName ||
    sellerData.mfgSellerName ||
    sellerData.vaBrandName ||
    sellerData.otherSellerName ||
    sellerData.businessName ||
    base.businessName;

  const accountName =
    userObj.name ||
    userObj.username ||
    sellerData.ownerName ||
    businessName ||
    "";

  const documents = normalizeDocumentsMap([
    userObj.documents,
    userObj.uploadedDocs,
    userObj.application?.documents,
    sellerData.documents,
    sellerData.uploadedDocs,
    sellerData.unlockedDocuments,
  ]);

  const rawMobile = String(
    userObj.mobile || userObj.phone || sellerData.phone || sellerData.mobile || ""
  ).trim();
  const formattedPhone = rawMobile
    ? rawMobile.startsWith("+")
      ? rawMobile
      : `+91 ${rawMobile.replace(/^91(?=\d{10}$)/, "")}`
    : base.phone;

  const crops =
    Array.isArray(sellerData.farmerCrops) && sellerData.farmerCrops.length > 0
      ? sellerData.farmerCrops
      : Array.isArray(sellerData.crops) && sellerData.crops.length > 0
        ? sellerData.crops
        : [];

  return {
    ...base,
    accountName,
    businessName,
    sellerType: resolvedTypes[0] || base.sellerType,
    sellerTypes: resolvedTypes,
    email: userObj.email || sellerData.email || base.email,
    phone: formattedPhone,
    address: sellerData.farmAddress || base.address,
    farmAddress: sellerData.farmAddress || base.address,
    district: sellerData.district || "",
    village: sellerData.village || "",
    state: sellerData.state || base.state || "Tamil Nadu",
    pinCode: sellerData.pinCode || base.pinCode,
    categories: crops,
    farmerFarmName: sellerData.farmerFarmName || "",
    fpoName: sellerData.fpoName || "",
    fpoStructure: sellerData.fpoStructure || "Farmer Producer Company (FPC)",
    fpoIsRegistered:
      sellerData.fpoIsRegistered || (sellerData.fpoRegNumber ? "Yes" : "No"),
    fpoRegNumber: sellerData.fpoRegNumber || "",
    organicFarmName: sellerData.organicFarmName || "",
    organicCertStatus:
      sellerData.organicCertStatus || "Certified Organic (NPOP)",
    organicHasLicense:
      sellerData.organicHasLicense ||
      (sellerData.organicScopeNumber ? "Yes" : "No"),
    organicScopeNumber: sellerData.organicScopeNumber || "",
    rawProviderName: sellerData.rawProviderName || "",
    ingProducerName: sellerData.ingProducerName || "",
    ingHasFssai:
      sellerData.ingHasFssai || (sellerData.ingFssaiNumber ? "Yes" : "No"),
    ingFssaiNumber: sellerData.ingFssaiNumber || "",
    mfgSellerName: sellerData.mfgSellerName || "",
    mfgHasFssai:
      sellerData.mfgHasFssai || (sellerData.mfgFssaiNumber ? "Yes" : "No"),
    mfgFssaiNumber: sellerData.mfgFssaiNumber || "",
    mfgIsGst: sellerData.mfgIsGst || (sellerData.mfgGstin ? "Yes" : "No"),
    mfgGstin: sellerData.mfgGstin || "",
    vaBrandName: sellerData.vaBrandName || "",
    vaHasFssai:
      sellerData.vaHasFssai || (sellerData.vaFssaiNumber ? "Yes" : "No"),
    vaFssaiNumber: sellerData.vaFssaiNumber || "",
    otherSellerName: sellerData.otherSellerName || "",
    otherActivity: sellerData.otherActivity || "",
    otherIsGst:
      sellerData.otherIsGst || (sellerData.otherGstin ? "Yes" : "No"),
    otherGstin: sellerData.otherGstin || "",
    documents,
    emailVerified: Boolean(
      userObj.emailVerified ??
        userObj.isEmailVerified ??
        Boolean(userObj.email || base.email)
    ),
    useAsBuyerToo: Boolean(
      userObj.useAsBuyerToo ??
        sellerData.useAsBuyerToo ??
        userObj.buyerOnboarded
    ),
    notificationChannels: {
      ...base.notificationChannels,
      ...(userObj.notificationChannels || sellerData.notificationChannels || {}),
    },
    preferences: {
      showPhoneToBuyers: true,
      showEmailToBuyers: true,
      enquiryDigest: true,
      preferredLanguage: "English",
      ...(userObj.preferences || sellerData.preferences || {}),
    },
  };
}

function buildProfileSavePayload(profile, mode) {
  if (mode === "settings") {
    return {
      useAsBuyerToo: Boolean(profile.useAsBuyerToo),
      notificationChannels: profile.notificationChannels || {},
      preferences: profile.preferences || {},
    };
  }

  const cleanPhone = String(profile.phone || "").replace(/\D/g, "");
  const cleanName = String(profile.accountName || "").trim();
  const resolvedBusinessName =
    profile.farmerFarmName ||
    profile.fpoName ||
    profile.organicFarmName ||
    profile.rawProviderName ||
    profile.ingProducerName ||
    profile.mfgSellerName ||
    profile.vaBrandName ||
    profile.otherSellerName ||
    profile.businessName ||
    cleanName;

  const sellerData = {
    businessName: resolvedBusinessName,
    ownerName: cleanName,
    farmAddress: profile.farmAddress ?? profile.address ?? "",
    address: profile.farmAddress ?? profile.address ?? "",
    district: profile.district || "",
    village: profile.village || "",
    city:
      profile.village && profile.district
        ? `${profile.village}, ${profile.district}`
        : profile.village || profile.district || "",
    state: profile.state || "Tamil Nadu",
    pinCode: profile.pinCode || "",
    farmerCrops: profile.categories || [],
    farmerFarmName: profile.farmerFarmName || "",
    fpoName: profile.fpoName || "",
    fpoStructure: profile.fpoStructure || "",
    fpoIsRegistered: profile.fpoIsRegistered || "No",
    fpoRegNumber: profile.fpoRegNumber || "",
    organicFarmName: profile.organicFarmName || "",
    organicCertStatus: profile.organicCertStatus || "",
    organicHasLicense: profile.organicHasLicense || "No",
    organicScopeNumber: profile.organicScopeNumber || "",
    rawProviderName: profile.rawProviderName || "",
    ingProducerName: profile.ingProducerName || "",
    ingHasFssai: profile.ingHasFssai || "No",
    ingFssaiNumber: profile.ingFssaiNumber || "",
    mfgSellerName: profile.mfgSellerName || "",
    mfgHasFssai: profile.mfgHasFssai || "No",
    mfgFssaiNumber: profile.mfgFssaiNumber || "",
    mfgIsGst: profile.mfgIsGst || "No",
    mfgGstin: profile.mfgGstin || "",
    vaBrandName: profile.vaBrandName || "",
    vaHasFssai: profile.vaHasFssai || "No",
    vaFssaiNumber: profile.vaFssaiNumber || "",
    otherSellerName: profile.otherSellerName || "",
    otherActivity: profile.otherActivity || "",
    otherIsGst: profile.otherIsGst || "No",
    otherGstin: profile.otherGstin || "",
    documents: profile.documents || {},
  };

  return {
    name: cleanName,
    username: cleanName,
    email: String(profile.email || "").trim().toLowerCase(),
    mobile: cleanPhone,
    documents: profile.documents || {},
    sellerData,
    ...sellerData,
  };
}

/**
 * Shared state hook powering both /seller/profile and /seller/settings.
 */
export function useSellerProfileState() {
  const router = useRouter();
  const sessionUser = useFullSessionUser();
  const [liveProfileUser, setLiveProfileUser] = useState(null);
  const [overrides, setOverrides] = useState({});

  const [isSaving, setIsSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getSellerProfile().catch(() => null),
      fetchCurrentUserProfile().catch(() => null),
    ]).then(([sellerRes, userRes]) => {
      if (!isMounted) return;

      const sellerObj =
        sellerRes?.success && sellerRes.data
          ? sellerRes.data.seller ||
            sellerRes.data.profile ||
            sellerRes.data.user ||
            sellerRes.data
          : null;
      const userObj = userRes?.success && userRes.user ? userRes.user : null;

      if (sellerObj || userObj) {
        const mergedBackend = {
          ...(userObj || {}),
          ...(sellerObj || {}),
          sellerData: {
            ...(userObj?.sellerData || {}),
            ...(userObj?.application?.profile || {}),
            ...(sellerObj?.sellerData || {}),
            ...(sellerObj?.application?.profile || {}),
            ...(sellerObj && !sellerObj.sellerData ? sellerObj : {}),
          },
          documents:
            sellerObj?.documents ||
            sellerObj?.application?.documents ||
            userObj?.documents ||
            userObj?.application?.documents ||
            sellerObj?.sellerData?.documents ||
            userObj?.sellerData?.documents ||
            null,
        };

        setLiveProfileUser(mergedBackend);

        updateSessionUserStorage((existing) => ({
          ...mergedBackend,
          ...existing,
          name: existing?.name || mergedBackend.name || "",
          email: existing?.email || mergedBackend.email || "",
          mobile: existing?.mobile || mergedBackend.mobile || "",
          subType: existing?.subType || mergedBackend.subType || "",
          sellerTypes:
            existing?.sellerTypes?.length > 0
              ? existing.sellerTypes
              : mergedBackend.sellerTypes || null,
          unlockedCategories:
            existing?.unlockedCategories?.length > 0
              ? existing.unlockedCategories
              : mergedBackend.unlockedCategories || null,
          documents:
            mergedBackend.documents ||
            existing?.documents ||
            existing?.uploadedDocs ||
            null,
          sellerData: {
            ...(mergedBackend.sellerData || {}),
            ...(existing?.sellerData || {}),
          },
        }));
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const mergedUser = useMemo(() => {
    if (!liveProfileUser) return sessionUser;
    return {
      ...liveProfileUser,
      ...sessionUser,
      name: sessionUser?.name || liveProfileUser.name || "",
      email: sessionUser?.email || liveProfileUser.email || "",
      mobile: sessionUser?.mobile || liveProfileUser.mobile || "",
      subType: sessionUser?.subType || liveProfileUser.subType || "",
      sellerType: sessionUser?.sellerType || liveProfileUser.sellerType || "",
      sellerTypes:
        sessionUser?.sellerTypes?.length > 0
          ? sessionUser.sellerTypes
          : liveProfileUser.sellerTypes || null,
      unlockedCategories: Array.from(
        new Set([
          ...(sessionUser?.unlockedCategories || []),
          ...(liveProfileUser.unlockedCategories || []),
        ])
      ),
      documents:
        sessionUser?.documents ||
        sessionUser?.uploadedDocs ||
        liveProfileUser.documents ||
        null,
      sellerData: {
        ...(liveProfileUser.sellerData || {}),
        ...(sessionUser?.sellerData || {}),
      },
    };
  }, [sessionUser, liveProfileUser]);

  const baseProfile = useMemo(
    () => deriveRichSellerProfile(mergedUser),
    [mergedUser]
  );

  const profile = useMemo(
    () => ({
      ...baseProfile,
      ...overrides,
      notificationChannels: {
        ...baseProfile.notificationChannels,
        ...(overrides.notificationChannels || {}),
      },
      preferences: {
        ...baseProfile.preferences,
        ...(overrides.preferences || {}),
      },
      documents: {
        ...baseProfile.documents,
        ...(overrides.documents || {}),
      },
    }),
    [baseProfile, overrides]
  );

  const hasUnsavedChanges = Object.keys(overrides).length > 0;

  const handleProfileFieldChange = (field, val) => {
    setSaveError("");
    setSaveNotice("");
    setOverrides((prev) => ({ ...prev, [field]: val }));
  };

  const handleToggleCategory = (cat) => {
    const currentCats = profile.categories || [];
    const exists = currentCats.includes(cat);
    const nextCats = exists
      ? currentCats.filter((c) => c !== cat)
      : [...currentCats, cat];
    handleProfileFieldChange("categories", nextCats);
  };

  const handleDocumentUploaded = (docType, docPayload) => {
    const nextDocs = {
      ...(profile.documents || {}),
      [docType]: docPayload,
    };
    setOverrides((prev) => ({ ...prev, documents: nextDocs }));
    updateSessionUserStorage((existing) => ({
      ...existing,
      documents: {
        ...(existing?.documents || {}),
        [docType]: docPayload,
      },
      sellerData: {
        ...(existing?.sellerData || {}),
        documents: {
          ...(existing?.sellerData?.documents || {}),
          [docType]: docPayload,
        },
      },
    }));
  };

  const handleToggleChannel = (channelKey) => {
    setSaveError("");
    setSaveNotice("");
    setOverrides((prev) => ({
      ...prev,
      notificationChannels: {
        ...profile.notificationChannels,
        [channelKey]: !profile.notificationChannels[channelKey],
      },
    }));
  };

  const handlePreferenceChange = (prefKey, val) => {
    setSaveError("");
    setSaveNotice("");
    setOverrides((prev) => ({
      ...prev,
      preferences: {
        ...profile.preferences,
        [prefKey]: val,
      },
    }));
  };

  const persistUpdates = async (mode = "profile") => {
    setSaveError("");
    setSaveNotice("");

    if (mode === "profile") {
      if (!String(profile.accountName || "").trim()) {
        setSaveError("Please enter your username.");
        return;
      }
      if (
        !String(profile.email || "").trim() ||
        !String(profile.email).includes("@")
      ) {
        setSaveError("Please enter a valid email address.");
        return;
      }
      const cleanPhone = String(profile.phone || "").replace(/\D/g, "");
      if (!cleanPhone || cleanPhone.length < 10) {
        setSaveError("Please enter a valid 10-digit mobile number.");
        return;
      }
      if (profile.pinCode && String(profile.pinCode).length !== 6) {
        setSaveError("PIN code must be 6 digits.");
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload = buildProfileSavePayload(profile, mode);

      updateSessionUserStorage((existing) => ({
        ...existing,
        ...(mode === "settings"
          ? {
              useAsBuyerToo: payload.useAsBuyerToo,
              notificationChannels: payload.notificationChannels,
              preferences: payload.preferences,
            }
          : {
              name: payload.name || existing?.name,
              username: payload.username || existing?.username,
              email: payload.email || existing?.email,
              mobile: payload.mobile || existing?.mobile,
              documents: payload.documents,
              sellerData: {
                ...(existing?.sellerData || {}),
                ...payload.sellerData,
              },
            }),
      }));

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("ulavan_registered_user");
        localStorage.removeItem("ulavan_registered_user");
      }

      const res = await updateSellerProfile(payload).catch(() => ({
        success: false,
        status: 0,
        error: "Unable to reach backend profile service.",
      }));

      if (res.success) {
        setOverrides({});
        setSaveNotice(
          mode === "settings"
            ? "Account settings saved successfully."
            : "Profile and onboarding details saved successfully."
        );
        return;
      }

      if (res.status >= 400 && res.status !== 404 && res.status !== 405) {
        setSaveError(res.error || `Server rejected update (${res.status}).`);
        return;
      }

      setOverrides({});
      setSaveNotice(
        mode === "settings"
          ? "Account settings updated in your active session."
          : "Profile details updated in your active session."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const resetChanges = () => {
    setOverrides({});
    setSaveError("");
    setSaveNotice("");
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      localStorage.removeItem("ulavan_auth_token");
      localStorage.removeItem("ulavan_registered_user");
      localStorage.removeItem("token");
    }
    router.push("/login");
  };

  return {
    profile,
    hasUnsavedChanges,
    isSaving,
    saveNotice,
    saveError,
    handleProfileFieldChange,
    handleToggleCategory,
    handleDocumentUploaded,
    handleToggleChannel,
    handlePreferenceChange,
    persistUpdates,
    resetChanges,
    handleLogout,
  };
}

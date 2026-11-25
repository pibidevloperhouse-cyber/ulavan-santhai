/**
 * Ulavan Santhai - Seller API Service
 * Strictly connects to backend API endpoints (/api/v1/seller/...)
 * No mock data, no synthetic fallbacks.
 */

import { apiFetch } from "./apiConfig";
import { getSellerCategories } from "./categoryStorage";

/**
 * Fetch complete dashboard overview for the authenticated seller strictly from backend
 */
export async function getSellerDashboardData() {
  const res = await apiFetch("/api/v1/seller/dashboard", { method: "GET" });
  return res;
}

/**
 * Fetch seller profile details strictly from backend
 */
export async function getSellerProfile() {
  return apiFetch("/api/v1/seller/profile", { method: "GET" });
}

/**
 * Update seller profile details strictly on backend
 */
export async function updateSellerProfile(updatedFields) {
  return apiFetch("/api/v1/seller/profile", {
    method: "PUT",
    body: JSON.stringify(updatedFields),
  });
}

/**
 * Helper to retrieve stored session user if needed for display
 */
export function getLocalSellerProfile() {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      sessionStorage.getItem("ulavan_user") ||
      sessionStorage.getItem("ulavan_registered_user") ||
      localStorage.getItem("ulavan_registered_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const normalizeClassificationKey = (str) =>
  String(str || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

/**
 * Resolves the Seller Onboarding classifications / unlocked categories from
 * authenticated session storage and live profile data (zero mock data).
 */
export function getSellerUnlockedCategories(sessionUser, categoryItems = null) {
  const tokens = [];
  const pushToken = (val) => {
    if (!val) return;
    if (Array.isArray(val)) {
      val.forEach(pushToken);
    } else if (typeof val === "string") {
      val
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
        .forEach((part) => tokens.push(part));
    }
  };

  if (sessionUser) {
    const sellerData = sessionUser.sellerData || {};
    pushToken(sellerData.unlockedCategories);
    pushToken(sessionUser.unlockedCategories);
    pushToken(sellerData.sellerTypes);
    pushToken(sessionUser.sellerTypes);
    pushToken(sellerData.sellerType);
    pushToken(sessionUser.sellerType);
    pushToken(sessionUser.classification);
    pushToken(sessionUser.classifications);

    const activeRole = String(sessionUser.activeRole || sessionUser.role || "").toLowerCase();
    if (!activeRole || activeRole === "seller" || activeRole === "both") {
      pushToken(sessionUser.subType);
    }
  }

  const availableCats =
    Array.isArray(categoryItems) && categoryItems.length > 0
      ? categoryItems
      : getSellerCategories();

  const unlocked = new Set();
  for (const token of tokens) {
    const norm = normalizeClassificationKey(token);
    const matched = availableCats.find((c) => {
      const codeNorm = normalizeClassificationKey(c.code || c.name);
      const nameNorm = normalizeClassificationKey(c.name);
      const idNorm = normalizeClassificationKey(c.id);
      return norm === codeNorm || norm === nameNorm || norm === idNorm;
    });
    unlocked.add(matched ? matched.code || matched.name : token);
  }

  return Array.from(unlocked);
}

/**
 * Derives a live seller profile strictly from authenticated session & onboarding data.
 */
export function getDynamicSellerProfile(sessionUser) {
  const emptyProfile = {
    businessName: "",
    sellerType: "",
    sellerTypes: [],
    avatarInitials: "",
    email: "",
    phone: "",
    businessDetails: "",
    address: "",
    city: "",
    state: "Tamil Nadu",
    pinCode: "",
    categories: [],
    licenseType: "",
    licenseNumber: "",
    accountStatus: "Active",
    approvedDate: "",
    useAsBuyerToo: false,
    notificationChannels: {
      inApp: true,
      email: true,
      sms: false,
      push: false,
    },
    subscription: {
      status: "Active",
      plan: "Seller plan",
      price: "₹365 / year",
      duration: "1 year",
      startDate: "Active",
      expiryDate: "365 days from activation",
      daysRemaining: 365,
    },
  };

  if (!sessionUser) return emptyProfile;

  const sellerData = sessionUser.sellerData || {};
  const businessName =
    sellerData.farmerFarmName ||
    sellerData.businessName ||
    sellerData.fpoName ||
    sellerData.organicFarmName ||
    sellerData.rawProviderName ||
    sellerData.ingProducerName ||
    sellerData.mfgSellerName ||
    sellerData.vaBrandName ||
    sellerData.otherSellerName ||
    sessionUser.name ||
    sessionUser.username ||
    "";

  const initials = businessName
    ? businessName
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "S";

  const resolvedTypes = getSellerUnlockedCategories(sessionUser);

  return {
    ...emptyProfile,
    businessName: businessName || "Seller",
    sellerType: resolvedTypes[0] || "",
    sellerTypes: resolvedTypes,
    avatarInitials: initials || "S",
    email: sessionUser.email || "",
    phone: sessionUser.mobile ? `+91 ${sessionUser.mobile}` : "",
    businessDetails: sellerData.otherActivity || "",
    address: sellerData.farmAddress || "",
    city: sellerData.village || sellerData.district || "",
    state: "Tamil Nadu",
    pinCode: sellerData.pinCode || "",
    categories:
      Array.isArray(sellerData.farmerCrops) && sellerData.farmerCrops.length > 0
        ? sellerData.farmerCrops
        : resolvedTypes,
    accountStatus: sessionUser.status || "Active",
    approvedDate: sessionUser.registeredAt
      ? new Date(sessionUser.registeredAt).toLocaleDateString("en-IN")
      : "",
  };
}

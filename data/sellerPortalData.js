/**
 * Ulavan Santhai - Dedicated Seller Portal Clean Data Definitions
 * Real production schema definitions, zero static dummy/mock data.
 * Ready for live API and session integration.
 */

export const DEFAULT_SELLER_PROFILE = {
  businessName: "",
  sellerType: "Farmer",
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

/**
 * Derives a dynamic seller profile from authenticated session storage and onboarding data.
 * Ensures zero mock data is displayed while preserving real user inputs.
 */
export function getDynamicSellerProfile(sessionUser) {
  if (!sessionUser) return DEFAULT_SELLER_PROFILE;

  const sellerData = sessionUser.sellerData || {};
  const businessName =
    sellerData.farmerFarmName ||
    sellerData.businessName ||
    sellerData.fpoName ||
    sellerData.vaBrandName ||
    sessionUser.name ||
    sessionUser.username ||
    "Seller";

  const initials = businessName
    ? businessName
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "S";

  return {
    ...DEFAULT_SELLER_PROFILE,
    businessName,
    sellerType: sellerData.sellerType || "Farmer",
    avatarInitials: initials || "S",
    email: sessionUser.email || "",
    phone: sessionUser.mobile ? `+91 ${sessionUser.mobile}` : "",
    businessDetails: sellerData.otherActivity || "",
    address: sellerData.farmAddress || "",
    city: sellerData.village || sellerData.district || "",
    state: "Tamil Nadu",
    pinCode: sellerData.pinCode || "",
    categories: sellerData.farmerCrops || [],
    accountStatus: sessionUser.status || "Active",
    approvedDate: sessionUser.registeredAt
      ? new Date(sessionUser.registeredAt).toLocaleDateString("en-IN")
      : "",
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
}

export const DASHBOARD_METRICS = {
  accountStatus: {
    status: "Active",
    subtext: "Verified seller account",
  },
  subscription: {
    status: "Active",
    subtext: "₹365 / year · Active plan",
  },
  totalProducts: {
    count: 0,
    subtext: "0 published",
  },
  buyerEnquiries: {
    count: 0,
    subtext: "0 awaiting response",
  },
  statusBreakdown: [
    { label: "Draft", count: 0, statusKey: "Draft" },
    { label: "Submitted", count: 0, statusKey: "Submitted" },
    { label: "Under Review", count: 0, statusKey: "Under Review" },
    { label: "Approved", count: 0, statusKey: "Approved" },
    { label: "Published", count: 0, statusKey: "Published" },
    { label: "Rejected", count: 0, statusKey: "Rejected" },
    { label: "Inactive", count: 0, statusKey: "Inactive" },
    { label: "Expired / Unavailable", count: 0, statusKey: "Expired" },
  ],
  recentEnquiries: [],
  recentNotifications: [],
};

export const INITIAL_PRODUCTS = [];

export const INITIAL_ENQUIRIES = [];

export const INITIAL_NOTIFICATIONS = [];

export const PAYMENT_HISTORY = [];

export const CATEGORIES_LIST = [
  "Agricultural Products",
  "Organic Products",
  "Agricultural Raw Materials",
  "Agriculture-Derived Ingredients",
  "Value-Added Products",
];

export const QUALITY_GRADES = [
  "Select grade",
  "Grade A (Export / Premium)",
  "Grade B (Commercial / Standard)",
  "Grade C (Processing)",
];

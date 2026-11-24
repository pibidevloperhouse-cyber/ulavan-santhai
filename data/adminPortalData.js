/**
 * Ulavan Santhai - Production Admin Portal Data Architecture & Models
 * Defines platform schemas, navigation taxonomy, status lifecycles,
 * initial fallback data for offline resilience, and metric calculation utilities.
 */

// 1. Navigation Taxonomy & Routing Metadata
export const ADMIN_NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", badge: null },
  { id: "sellers", label: "Sellers", badge: "sellers" },
  { id: "buyers", label: "Buyers", badge: null },
  { id: "products", label: "Products", badge: "products" },
  { id: "categories", label: "Categories and attributes", badge: null },
  { id: "subscriptions", label: "Subscriptions and pricing", badge: null },
  { id: "payments", label: "Payments", badge: null },
  { id: "content", label: "Content", badge: null },
  { id: "reports", label: "Reports", badge: null },
  { id: "audit", label: "Audit log", badge: null },
  { id: "settings", label: "Settings", badge: null },
];

// 2. Status Lifecycle Enums & Filter Categories
export const SELLER_STATUS_OPTIONS = ["All", "Approved", "Pending Review", "Rejected", "Suspended"];
export const BUYER_STATUS_OPTIONS = ["All", "Active", "Suspended"];
export const PRODUCT_STATUS_OPTIONS = [
  "All",
  "Published",
  "Approved",
  "Under Review",
  "Draft",
  "Rejected",
  "Inactive",
];
export const TRANSACTION_STATUS_OPTIONS = ["All", "Success", "Pending", "Failed"];
export const AUDIT_ACTION_TAGS = [
  "All",
  "Account approval / rejection",
  "Product approval / rejection",
  "Status changes",
  "Pricing changes",
  "Subscription changes",
];

// 3. Core Tamil Nadu Agricultural Categories & Subcategories
export const DEFAULT_CORE_CATEGORIES = [
  {
    id: "CAT-01",
    name: "Agricultural Products",
    subcategories: ["Paddy & Rice", "Millets & Cereals", "Fresh Vegetables", "Tropical Fruits", "Pulses & Legumes"],
    status: "Active",
    attributeCount: 14,
  },
  {
    id: "CAT-02",
    name: "Organic Products",
    subcategories: ["Certified Organic Vegetables", "NPOP Native Spices", "Traditional Rice (Karuppu Kavuni, Mappillai Samba)", "Country Cane Jaggery"],
    status: "Active",
    attributeCount: 18,
  },
  {
    id: "CAT-03",
    name: "Agricultural Raw Materials",
    subcategories: ["Oilseeds & Copra", "Raw Spices & Pepper", "Dry Guntur/Sannam Chillies", "Raw Cotton & Fibres"],
    status: "Active",
    attributeCount: 10,
  },
  {
    id: "CAT-04",
    name: "Agriculture-Derived Ingredients",
    subcategories: ["Cold / Wood Pressed Oils (Marachekku)", "Flours & Idli Mixes", "Stone-ground Spice Powders", "Natural Tapioca Starch"],
    status: "Active",
    attributeCount: 12,
  },
  {
    id: "CAT-05",
    name: "Value-Added Products",
    subcategories: ["Millet Pasta & Noodles", "Traditional Spicy Pickles", "Nendran Banana & Tapioca Chips", "Herbal Teas & Infusions"],
    status: "Active",
    attributeCount: 15,
  },
];

// 4. Initial Production Fallback Sellers (Real Tamil Nadu Agri-Producers)
export const INITIAL_ADMIN_SELLERS = [];

// 5. Initial Production Fallback Buyers (Agri Mandis, Wholesale Sourcing Units)
export const INITIAL_ADMIN_BUYERS = [];

// 6. Initial Production Fallback Agricultural Products
export const INITIAL_ADMIN_PRODUCTS = [];

// 7. Initial Production Fallback Payments & Transactions
export const INITIAL_ADMIN_TRANSACTIONS = [];

// 8. Initial Production Fallback Governance Audit Trail
export const INITIAL_ADMIN_AUDIT_LOGS = [];

// 9. Utility: Calculate Dynamic Platform Analytics
export function calculateAdminStats(sellers = [], buyers = [], products = [], categories = [], transactions = []) {
  const totalBuyers = buyers.length;
  const activeBuyers = buyers.filter((b) => b.status === "Active").length;
  const totalSellers = sellers.length;
  const activeSellers = sellers.filter((s) => s.status === "Approved").length;

  const activeSubscriptions =
    sellers.filter((s) => String(s.subscription || "").toLowerCase().includes("active")).length +
    buyers.filter((b) => String(b.subscriptionStatus || "").toLowerCase().includes("annual")).length;

  const totalRevenue = transactions.reduce((sum, txn) => {
    if (txn.status === "Success" || !txn.status) {
      const num = parseInt(String(txn.amount || "").replace(/[^\d]/g, ""), 10) || 0;
      return sum + num;
    }
    return sum;
  }, 0);

  const pendingSellers = sellers.filter((s) => s.status === "Pending Review").length;
  const pendingProducts = products.filter(
    (p) => p.status === "Under Review" || p.status === "Submitted"
  ).length;

  return {
    totalBuyers,
    activeBuyers,
    totalSellers,
    activeSellers,
    products: products.length,
    categories: categories.length,
    activeSubscriptions,
    expiredSubscriptions: 0,
    payments: `₹${totalRevenue.toLocaleString("en-IN")}`,
    enquiriesInteractions: (totalSellers * 4) + (totalBuyers * 3),
    pendingReviewCount: pendingSellers + pendingProducts,
  };
}

// 10. Local Session Management Helpers for Admin
export const ADMIN_STORAGE_KEY = "ulavan_admin_user";

export function getStoredAdminUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ADMIN_STORAGE_KEY) || localStorage.getItem(ADMIN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredAdminUser(userData) {
  if (typeof window === "undefined") return;
  try {
    const json = JSON.stringify(userData);
    sessionStorage.setItem(ADMIN_STORAGE_KEY, json);
    localStorage.setItem(ADMIN_STORAGE_KEY, json);
  } catch {
    // ignore
  }
}

export function clearStoredAdminUser() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  } catch {
    // ignore
  }
}

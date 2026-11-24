/**
 * Ulavan Santhai - Dynamic Shared Category Management Layer
 * Provides live synchronization between Admin Portal "Categories and attributes"
 * and Buyer / Seller Onboarding Forms via local persistence and reactive events.
 */

export const DEFAULT_SELLER_CATEGORIES = [
  {
    id: "CAT-SEL-01",
    name: "Farmer & Agricultural Cultivators",
    code: "Farmer",
    role: "seller",
    subcategories: [
      "Paddy / Rice",
      "Banana",
      "Mango",
      "Tomato",
      "Onion",
      "Coconut",
      "Turmeric",
      "Millets",
      "Groundnut",
      "Sugarcane",
      "Spices",
      "Vegetables",
      "Flowers",
    ],
    status: "Active",
  },
  {
    id: "CAT-SEL-02",
    name: "Agricultural Producer (FPO / Society)",
    code: "Agricultural Producer",
    role: "seller",
    subcategories: [
      "Farmer Producer Company (FPC)",
      "Registered Cooperative Society",
      "Joint Liability Group (JLG)",
      "Self Help Group (SHG)",
      "Farmer Cluster Collective",
    ],
    status: "Active",
  },
  {
    id: "CAT-SEL-03",
    name: "Organic Producer",
    code: "Organic Producer",
    role: "seller",
    subcategories: [
      "Certified Organic Vegetables",
      "NPOP Spices",
      "Native Heritage Rice (Karuppu Kavuni, Mappillai Samba)",
      "Country Jaggery & Palm Sugar",
      "Natural Farming Produce (Uncertified)",
    ],
    status: "Active",
  },
  {
    id: "CAT-SEL-04",
    name: "Raw-Material Provider",
    code: "Raw-Material Provider",
    role: "seller",
    subcategories: [
      "Oilseeds & Copra",
      "Raw Spices & Pepper",
      "Dry Chillies (Guntur/Sannam)",
      "Raw Cotton & Agro Fibres",
      "Sugarcane Stalks",
    ],
    status: "Active",
  },
  {
    id: "CAT-SEL-05",
    name: "Ingredient Producer",
    code: "Ingredient Producer",
    role: "seller",
    subcategories: [
      "Wood / Cold Pressed Oils (Marachekku)",
      "Flours & Idli Mixes",
      "Spice Powders & Masalas",
      "Natural Tapioca Starch",
      "Herbal Extracts",
    ],
    status: "Active",
  },
  {
    id: "CAT-SEL-06",
    name: "Manufacturer",
    code: "Manufacturer",
    role: "seller",
    subcategories: [
      "Food & Beverage",
      "Animal & Cattle Feed",
      "Agro-Textiles & Jute",
      "Bio-Energy & Briquettes",
      "Starch & Derivatives",
    ],
    status: "Active",
  },
  {
    id: "CAT-SEL-07",
    name: "Value-Added Manufacturer",
    code: "Value-Added Manufacturer",
    role: "seller",
    subcategories: [
      "Millet Pasta & Noodles",
      "Traditional Pickles",
      "Banana & Tapioca Chips",
      "Fruit Jams & Concentrates",
      "Moringa & Herbal Health Mixes",
    ],
    status: "Active",
  },
  {
    id: "CAT-SEL-08",
    name: "Other Agri Enterprises",
    code: "Other",
    role: "seller",
    subcategories: [
      "Agri Nursery & Saplings",
      "Bio-Fertilizers & Vermicompost",
      "Farm Equipment & Tools",
      "Beekeeping & Pure Honey",
    ],
    status: "Active",
  },
];

export const DEFAULT_BUYER_CATEGORIES = [
  {
    id: "CAT-BUY-01",
    name: "Individual Buyer / Consumer",
    code: "Individual",
    role: "buyer",
    subcategories: [
      "Fresh Vegetables",
      "Fruits",
      "Rice & Cereals",
      "Millets & Pulses",
      "Spices & Condiments",
      "Coconut & Oilseeds",
      "Dairy Products",
      "Organic Produce",
    ],
    status: "Active",
  },
  {
    id: "CAT-BUY-02",
    name: "Business / Mandi Trader",
    code: "Business",
    role: "buyer",
    subcategories: [
      "Mandi Wholesale Commission Agent",
      "Commercial Grain Merchant",
      "Vegetable & Fruit Wholesaler",
      "Commodity Exporter",
      "Food Distribution Network",
    ],
    status: "Active",
  },
  {
    id: "CAT-BUY-03",
    name: "Industrial Manufacturer",
    code: "Manufacturer",
    role: "buyer",
    subcategories: [
      "Food & Beverage",
      "Textiles & Cotton",
      "Animal & Cattle Feed",
      "Herbal & Ayurvedic Extracts",
      "Starch & Derivatives",
      "Bio-Energy",
    ],
    status: "Active",
  },
  {
    id: "CAT-BUY-04",
    name: "Reseller / Grocery Shop",
    code: "Reseller",
    role: "buyer",
    subcategories: [
      "Retail Grocery / Supermarket",
      "Vegetable & Fruit Retail Outlet",
      "Organic Specialty Store",
      "Online Direct Reseller",
      "Neighborhood Kirana Store",
    ],
    status: "Active",
  },
  {
    id: "CAT-BUY-05",
    name: "Food Processor & Commercial Kitchen",
    code: "Food Processor",
    role: "buyer",
    subcategories: [
      "Commercial Bakery",
      "Hotels, Restaurants & Catering (HoReCa)",
      "Cloud Kitchen",
      "Rice & Oil Milling Units",
      "Pickle & Food Processing Unit",
    ],
    status: "Active",
  },
  {
    id: "CAT-BUY-06",
    name: "Other Institutional Buyers",
    code: "Other",
    role: "buyer",
    subcategories: [
      "School & College Hostels",
      "Corporate Mess & Canteens",
      "Hospital & Healthcare Mess",
      "Government Procurement Agencies",
    ],
    status: "Active",
  },
];

const SELLER_STORAGE_KEY = "ulavan_admin_seller_categories";
const BUYER_STORAGE_KEY = "ulavan_admin_buyer_categories";
const CATEGORY_UPDATE_EVENT = "ulavan_categories_updated";

/**
 * Dispatch custom window event to trigger cross-component dynamic UI sync
 */
function notifyCategoryUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CATEGORY_UPDATE_EVENT));
  }
}

/**
 * Retrieve Seller Categories from localStorage or fall back to defaults
 */
export function getSellerCategories() {
  if (typeof window === "undefined") return DEFAULT_SELLER_CATEGORIES;
  try {
    const raw = localStorage.getItem(SELLER_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SELLER_STORAGE_KEY, JSON.stringify(DEFAULT_SELLER_CATEGORIES));
      return DEFAULT_SELLER_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SELLER_CATEGORIES;
  } catch {
    return DEFAULT_SELLER_CATEGORIES;
  }
}

/**
 * Retrieve Buyer Categories from localStorage or fall back to defaults
 */
export function getBuyerCategories() {
  if (typeof window === "undefined") return DEFAULT_BUYER_CATEGORIES;
  try {
    const raw = localStorage.getItem(BUYER_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BUYER_STORAGE_KEY, JSON.stringify(DEFAULT_BUYER_CATEGORIES));
      return DEFAULT_BUYER_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_BUYER_CATEGORIES;
  } catch {
    return DEFAULT_BUYER_CATEGORIES;
  }
}

/**
 * Save Seller Categories to storage and notify UI
 */
export function saveSellerCategories(categories) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SELLER_STORAGE_KEY, JSON.stringify(categories));
    notifyCategoryUpdate();
  } catch (err) {
    console.error("Failed to save seller categories:", err);
  }
}

/**
 * Save Buyer Categories to storage and notify UI
 */
export function saveBuyerCategories(categories) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BUYER_STORAGE_KEY, JSON.stringify(categories));
    notifyCategoryUpdate();
  } catch (err) {
    console.error("Failed to save buyer categories:", err);
  }
}

/**
 * Add a new Category (for Seller or Buyer)
 */
export function createCategoryItem(role, { name, subcategories = [], status = "Active" }) {
  const isSeller = role === "seller";
  const currentList = isSeller ? getSellerCategories() : getBuyerCategories();

  const newId = `CAT-${isSeller ? "SEL" : "BUY"}-${String(currentList.length + 1).padStart(2, "0")}`;
  const newCat = {
    id: newId,
    name: name.trim(),
    code: name.trim(),
    role: isSeller ? "seller" : "buyer",
    subcategories: Array.isArray(subcategories)
      ? subcategories.filter(Boolean)
      : subcategories.split(",").map((s) => s.trim()).filter(Boolean),
    status,
  };

  const updatedList = [newCat, ...currentList];
  if (isSeller) {
    saveSellerCategories(updatedList);
  } else {
    saveBuyerCategories(updatedList);
  }

  return newCat;
}

/**
 * Add a subcategory to an existing category
 */
export function addSubcategoryItem(role, categoryId, subcategoryName) {
  const trimmed = subcategoryName.trim();
  if (!trimmed) return false;

  const isSeller = role === "seller";
  const currentList = isSeller ? getSellerCategories() : getBuyerCategories();

  const updatedList = currentList.map((cat) => {
    if (cat.id !== categoryId) return cat;
    const exists = cat.subcategories?.some((s) => s.toLowerCase() === trimmed.toLowerCase());
    if (exists) return cat;
    return {
      ...cat,
      subcategories: [...(cat.subcategories || []), trimmed],
    };
  });

  if (isSeller) {
    saveSellerCategories(updatedList);
  } else {
    saveBuyerCategories(updatedList);
  }

  return true;
}

/**
 * Update an existing category details
 */
export function updateCategoryItem(role, updatedCategory) {
  const isSeller = role === "seller";
  const currentList = isSeller ? getSellerCategories() : getBuyerCategories();

  const updatedList = currentList.map((cat) =>
    cat.id === updatedCategory.id ? { ...cat, ...updatedCategory } : cat
  );

  if (isSeller) {
    saveSellerCategories(updatedList);
  } else {
    saveBuyerCategories(updatedList);
  }

  return true;
}

/**
 * Toggle category active/inactive status
 */
export function toggleCategoryStatus(role, categoryId) {
  const isSeller = role === "seller";
  const currentList = isSeller ? getSellerCategories() : getBuyerCategories();

  let newStatus = "Active";
  const updatedList = currentList.map((cat) => {
    if (cat.id !== categoryId) return cat;
    newStatus = cat.status === "Active" ? "Inactive" : "Active";
    return { ...cat, status: newStatus };
  });

  if (isSeller) {
    saveSellerCategories(updatedList);
  } else {
    saveBuyerCategories(updatedList);
  }

  return newStatus;
}

/**
 * Delete a category by ID
 */
export function deleteCategoryItem(role, categoryId) {
  const isSeller = role === "seller";
  const currentList = isSeller ? getSellerCategories() : getBuyerCategories();
  const updatedList = currentList.filter((cat) => cat.id !== categoryId);

  if (isSeller) {
    saveSellerCategories(updatedList);
  } else {
    saveBuyerCategories(updatedList);
  }

  return true;
}

/**
 * Reorder category list
 */
export function reorderCategoryItem(role, categoryId, direction = "up") {
  const isSeller = role === "seller";
  const list = [...(isSeller ? getSellerCategories() : getBuyerCategories())];
  const index = list.findIndex((c) => c.id === categoryId);
  if (index === -1) return false;

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= list.length) return false;

  const [moved] = list.splice(index, 1);
  list.splice(targetIndex, 0, moved);

  if (isSeller) {
    saveSellerCategories(list);
  } else {
    saveBuyerCategories(list);
  }

  return true;
}

/**
 * Reset all categories to system defaults
 */
export function resetCategoriesToDefault(role = "all") {
  if (role === "seller" || role === "all") {
    saveSellerCategories(DEFAULT_SELLER_CATEGORIES);
  }
  if (role === "buyer" || role === "all") {
    saveBuyerCategories(DEFAULT_BUYER_CATEGORIES);
  }
}

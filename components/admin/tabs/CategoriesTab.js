"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Layers,
  Edit2,
  ArrowUpDown,
  Check,
  X,
  Search,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Trash2,
  Store,
  Users,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  getSellerCategories,
  getBuyerCategories,
  createCategoryItem,
  addSubcategoryItem,
  updateCategoryItem,
  toggleCategoryStatus,
  deleteCategoryItem,
  reorderCategoryItem,
  resetCategoriesToDefault,
} from "@/services/categoryStorage";

export default function CategoriesTab({ onNotify }) {
  // Role Tab: 'seller' | 'buyer'
  const [activeRole, setActiveRole] = useState("seller");
  const [searchTerm, setSearchTerm] = useState("");

  // Category State loaded from shared categoryStorage
  const [sellerCats, setSellerCats] = useState([]);
  const [buyerCats, setBuyerCats] = useState([]);

  // Modals State
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [showAddSubcatModal, setShowAddSubcatModal] = useState(false);
  const [showEditCatModal, setShowEditCatModal] = useState(false);

  // Form State for Create Category
  const [newCatRole, setNewCatRole] = useState("seller");
  const [newCatName, setNewCatName] = useState("");
  const [newCatSubcategories, setNewCatSubcategories] = useState("");

  // Form State for Create Subcategory
  const [subcatRole, setSubcatRole] = useState("seller");
  const [subcatParentId, setSubcatParentId] = useState("");
  const [subcatName, setSubcatName] = useState("");

  // Form State for Edit Category
  const [editingCategory, setEditingCategory] = useState(null);

  // Configuration Modals (Grades, Statuses, Attributes)
  const [gradeModal, setGradeModal] = useState(false);
  const [grades, setGrades] = useState(["Grade A", "Grade B", "Grade C"]);
  const [newGradeInput, setNewGradeInput] = useState("");

  const [statusModal, setStatusModal] = useState(false);
  const [statuses, setStatuses] = useState(["Available", "Harvest Ready", "Seasonal", "Out of Stock"]);
  const [newStatusInput, setNewStatusInput] = useState("");

  const [attributeModal, setAttributeModal] = useState(false);
  const [attributes, setAttributes] = useState([
    { name: "MOQ Units", values: "Quintal, Tonne, kg, Bag (50kg)" },
    { name: "Moisture Content %", values: "Standard max 12%, Sun-dried" },
    { name: "Origin Geo-tag", values: "District / Taluk certification" },
  ]);

  // Load and refresh categories from storage
  const loadCategories = () => {
    const s = getSellerCategories();
    const b = getBuyerCategories();
    setSellerCats(s);
    setBuyerCats(b);
  };

  useEffect(() => {
    loadCategories();

    const handleUpdate = () => {
      loadCategories();
    };

    window.addEventListener("ulavan_categories_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("ulavan_categories_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const currentCategories = activeRole === "seller" ? sellerCats : buyerCats;

  const filteredCategories = currentCategories.filter((cat) => {
    const term = searchTerm.toLowerCase();
    const matchesName = cat.name.toLowerCase().includes(term);
    const matchesSub = cat.subcategories?.some((sub) => sub.toLowerCase().includes(term));
    return matchesName || matchesSub;
  });

  // Handle Toggle Active/Inactive
  const handleToggle = (catId) => {
    const newStatus = toggleCategoryStatus(activeRole, catId);
    loadCategories();
    if (onNotify) {
      onNotify(`Category marked as ${newStatus}. Synced with onboarding form.`);
    }
  };

  // Handle Delete
  const handleDelete = (cat) => {
    if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      deleteCategoryItem(activeRole, cat.id);
      loadCategories();
      if (onNotify) {
        onNotify(`Category "${cat.name}" deleted. Removed from onboarding form.`);
      }
    }
  };

  // Handle Reorder
  const handleReorder = (catId, dir) => {
    reorderCategoryItem(activeRole, catId, dir);
    loadCategories();
    if (onNotify) {
      onNotify(`Category priority updated.`);
    }
  };

  // Handle Submit Create Category
  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const subList = newCatSubcategories
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const created = createCategoryItem(newCatRole, {
      name: newCatName.trim(),
      subcategories: subList.length > 0 ? subList : ["General Agricultural Produce"],
      status: "Active",
    });

    loadCategories();
    setShowAddCatModal(false);
    setNewCatName("");
    setNewCatSubcategories("");

    if (onNotify) {
      onNotify(`Created "${created.name}" for ${newCatRole === "seller" ? "Seller" : "Buyer"} onboarding!`);
    }
  };

  // Handle Submit Create Subcategory
  const handleCreateSubcategory = (e) => {
    e.preventDefault();
    if (!subcatName.trim() || !subcatParentId) return;

    addSubcategoryItem(subcatRole, subcatParentId, subcatName.trim());
    loadCategories();
    setShowAddSubcatModal(false);
    setSubcatName("");

    if (onNotify) {
      onNotify(`Added subcategory "${subcatName}" to onboarding options.`);
    }
  };

  // Handle Open Edit Modal
  const handleOpenEdit = (cat) => {
    setEditingCategory({
      ...cat,
      subcategoriesStr: cat.subcategories?.join(", ") || "",
    });
    setShowEditCatModal(true);
  };

  // Handle Save Edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name.trim()) return;

    const subList = editingCategory.subcategoriesStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    updateCategoryItem(activeRole, {
      ...editingCategory,
      name: editingCategory.name.trim(),
      subcategories: subList,
    });

    loadCategories();
    setShowEditCatModal(false);

    if (onNotify) {
      onNotify(`Updated "${editingCategory.name}". Changes live in onboarding forms.`);
    }
  };

  // Handle Reset to Defaults
  const handleResetDefaults = () => {
    if (confirm("Reset categories to standard agricultural baseline?")) {
      resetCategoriesToDefault(activeRole);
      loadCategories();
      if (onNotify) {
        onNotify(`Reset ${activeRole} categories to default taxonomy.`);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Role Selector Tabs (Seller Categories vs Buyer Categories) */}
      <div className="bg-white p-3 sm:p-4 rounded-3xl border border-gray-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Toggle Pills */}
        <div className="inline-flex p-1.5 rounded-2xl bg-gray-100/90 border border-gray-200/80 gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveRole("seller")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeRole === "seller"
                ? "bg-[#174B35] text-white shadow-sm shadow-emerald-950/20 scale-[1.01]"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
            }`}
          >
            <Store className="w-4 h-4 shrink-0" />
            <span>Seller Categories</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeRole === "seller"
                  ? "bg-white/20 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {sellerCats.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRole("buyer")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeRole === "buyer"
                ? "bg-[#174B35] text-white shadow-sm shadow-emerald-950/20 scale-[1.01]"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Buyer Categories</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeRole === "buyer"
                  ? "bg-white/20 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {buyerCats.length}
            </span>
          </button>
        </div>

        {/* Live Onboarding Synchronization Indicator */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-[#E8F0E3]/70 border border-[#729B59]/40 text-xs font-semibold text-[#174B35]">
          <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
          <span>Live Sync Active: Real-time update to Onboarding Forms</span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Categories Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            {/* Card Header matching reference image */}
            <div className="p-4 sm:p-5 border-b border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  {activeRole === "seller" ? "Seller Categories" : "Buyer Categories"} ({currentCategories.length})
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {activeRole === "seller"
                    ? "Categories and crop types used in Seller Registration & Onboarding"
                    : "Categories and commodities used in Buyer Registration & Discovery"}
                </p>
              </div>

              {/* Action Buttons: Create Category & Create Subcategory */}
              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setNewCatRole(activeRole);
                    setShowAddCatModal(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-sm hover:shadow-emerald-950/20 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Category</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSubcatRole(activeRole);
                    setSubcatParentId(currentCategories[0]?.id || "");
                    setShowAddSubcatModal(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-[#174B35] border border-gray-300 hover:border-gray-400 text-xs font-bold transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Subcategory</span>
                </button>
              </div>
            </div>

            {/* Quick Filter Search Bar */}
            <div className="px-4 py-2.5 bg-gray-50/70 border-b border-gray-200/80 flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Search ${activeRole} categories or subcategories...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#174B35]"
                />
              </div>

              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-[11px] font-bold text-gray-500 hover:text-[#174B35] underline cursor-pointer"
              >
                Reset Defaults
              </button>
            </div>

            {/* Categories Table View */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/90 border-b border-gray-200/80 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-3.5 pl-5 w-1/3">Category</th>
                    <th className="p-3.5 w-5/12">Subcategories</th>
                    <th className="p-3.5 text-right pr-5 w-1/4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-gray-500">
                        No categories found matching &quot;{searchTerm}&quot;.
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((cat, idx) => {
                      const isActive = cat.status === "Active";
                      return (
                        <tr
                          key={cat.id}
                          className="hover:bg-emerald-50/30 transition-colors group"
                        >
                          {/* Category Column */}
                          <td className="p-3.5 pl-5 font-bold text-gray-900 align-top">
                            <div className="flex items-start gap-2.5">
                              <div className="w-6 h-6 rounded-lg bg-[#E8F0E3] text-[#174B35] flex items-center justify-center shrink-0 mt-0.5">
                                <Layers className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <span className="text-xs sm:text-sm font-extrabold text-gray-900 block leading-tight">
                                  {cat.name}
                                </span>
                                <span
                                  className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isActive
                                      ? "bg-[#E8F0E3] text-[#174B35] border border-[#729B59]/40"
                                      : "bg-gray-100 text-gray-500 border border-gray-200"
                                  }`}
                                >
                                  {cat.status}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Subcategories Column */}
                          <td className="p-3.5 align-top">
                            <div className="flex flex-wrap gap-1.5">
                              {cat.subcategories && cat.subcategories.length > 0 ? (
                                cat.subcategories.map((sub, i) => (
                                  <span
                                    key={i}
                                    className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#F8FAF7] border border-gray-200/90 text-gray-700 shadow-2xs hover:border-[#729B59] transition-colors"
                                  >
                                    {sub}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[11px] text-gray-400 italic">
                                  No subcategories defined
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Actions Column */}
                          <td className="p-3.5 text-right pr-5 align-top">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(cat)}
                                className="px-2.5 py-1 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-[11px] font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Edit2 className="w-3 h-3 text-gray-500" />
                                <span>Edit</span>
                              </button>

                              {/* Reorder Buttons */}
                              <div className="inline-flex rounded-lg border border-gray-300 bg-white shadow-2xs overflow-hidden">
                                <button
                                  type="button"
                                  title="Move Up"
                                  disabled={idx === 0}
                                  onClick={() => handleReorder(cat.id, "up")}
                                  className="p-1 hover:bg-gray-100 text-gray-600 disabled:opacity-30 cursor-pointer"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  title="Move Down"
                                  disabled={idx === filteredCategories.length - 1}
                                  onClick={() => handleReorder(cat.id, "down")}
                                  className="p-1 hover:bg-gray-100 text-gray-600 border-l border-gray-200 disabled:opacity-30 cursor-pointer"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Deactivate / Activate Button */}
                              <button
                                type="button"
                                onClick={() => handleToggle(cat.id)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                                  isActive
                                    ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200"
                                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                                }`}
                              >
                                {isActive ? "Deactivate" : "Activate"}
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                title="Delete Category"
                                onClick={() => handleDelete(cat)}
                                className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Note */}
          <div className="p-3.5 bg-gray-50 border-t border-gray-200/80 text-[11px] text-gray-500 flex items-center justify-between">
            <span>
              Changes save instantly into active registration forms across the platform.
            </span>
            <span className="font-bold text-[#174B35]">
              {filteredCategories.length} Categories Listed
            </span>
          </div>
        </div>

        {/* Right Column (1 Col): Attribute Configurations (from reference image) */}
        <div className="space-y-5">
          {/* Quality Grades Card */}
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900">Quality Grades</h4>
              <span className="text-[11px] text-[#174B35] font-bold bg-[#E8F0E3] px-2 py-0.5 rounded-md">
                {grades.length} Active
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {grades.map((g) => (
                <span
                  key={g}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-[#E8F0E3] text-[#174B35] border border-[#729B59]/40"
                >
                  {g}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Standard agricultural grading benchmarks applied across Tamil Nadu mandi produce lots.
            </p>
            <button
              type="button"
              onClick={() => setGradeModal(true)}
              className="w-full py-2 rounded-xl bg-white border border-gray-300 hover:bg-[#E8F0E3]/40 text-[#174B35] text-xs font-bold shadow-2xs cursor-pointer transition-colors"
            >
              Configure Grades
            </button>
          </div>

          {/* Availability Statuses Card */}
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900">Availability Statuses</h4>
              <span className="text-[11px] text-[#174B35] font-bold bg-[#E8F0E3] px-2 py-0.5 rounded-md">
                {statuses.length} Active
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {statuses.map((st) => (
                <span
                  key={st}
                  className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-[#E8F0E3] text-[#174B35] border border-[#729B59]/30"
                >
                  {st}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Seller crop readiness tags displayed on marketplace harvest listings.
            </p>
            <button
              type="button"
              onClick={() => setStatusModal(true)}
              className="w-full py-2 rounded-xl bg-white border border-gray-300 hover:bg-[#E8F0E3]/40 text-[#174B35] text-xs font-bold shadow-2xs cursor-pointer transition-colors"
            >
              Configure Statuses
            </button>
          </div>

          {/* Custom Specification Attributes Card */}
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900">Custom Attributes</h4>
              <span className="text-[11px] text-gray-400 font-semibold">{attributes.length} Configured</span>
            </div>
            <div className="space-y-2">
              {attributes.map((a, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-[#F8FAF7] border border-gray-200/80 text-xs">
                  <div className="font-bold text-gray-800">{a.name}</div>
                  <div className="text-gray-500 text-[11px] mt-0.5">{a.values}</div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setAttributeModal(true)}
              className="w-full py-2 rounded-xl bg-white border border-gray-300 hover:bg-[#E8F0E3]/40 text-[#174B35] text-xs font-bold shadow-2xs cursor-pointer transition-colors"
            >
              Configure Attributes
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: CREATE NEW CATEGORY                              */}
      {/* ======================================================== */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            {/* Top Green Accent Ribbon */}
            <div className="h-2 w-full bg-gradient-to-r from-[#174B35] via-emerald-500 to-[#174B35]" />

            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#174B35] shadow-xs">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                    <span>Create New Category</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-[#174B35]">
                      Taxonomy
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Adds a new category directly to Onboarding Forms &amp; Marketplace
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCatModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="p-6 space-y-4.5 text-xs">
              {/* Target Role Selector */}
              <div>
                <label className="block text-[11px] font-bold text-gray-800 tracking-wide uppercase mb-1.5">
                  Target Onboarding Form <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setNewCatRole("seller")}
                    className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border text-xs transition-all cursor-pointer ${
                      newCatRole === "seller"
                        ? "bg-[#174B35] text-white border-[#174B35] shadow-sm"
                        : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span>Seller Category</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCatRole("buyer")}
                    className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border text-xs transition-all cursor-pointer ${
                      newCatRole === "buyer"
                        ? "bg-[#174B35] text-white border-[#174B35] shadow-sm"
                        : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Buyer Category</span>
                  </button>
                </div>
              </div>

              {/* Category Name */}
              <div>
                <label className="block text-[11px] font-bold text-gray-800 tracking-wide uppercase mb-1.5">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    newCatRole === "seller"
                      ? "e.g. Hydroponic & Protected Cultivation"
                      : "e.g. Agri-Exporters & Global Sourcing"
                  }
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 hover:border-gray-400 rounded-xl text-gray-900 font-semibold placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all shadow-2xs"
                />
              </div>

              {/* Subcategories */}
              <div>
                <label className="block text-[11px] font-bold text-gray-800 tracking-wide uppercase mb-1.5">
                  Subcategories (comma separated)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Cherry Tomatoes, Baby Spinach, Bell Peppers, Microgreens"
                  value={newCatSubcategories}
                  onChange={(e) => setNewCatSubcategories(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 hover:border-gray-400 rounded-xl text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all shadow-2xs leading-relaxed"
                />
                <p className="text-[11px] text-gray-500 mt-1 font-medium">
                  Separate each subcategory with a comma (,). These appear dynamically in the onboarding form.
                </p>
              </div>

              {/* Live Info Banner */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-900 font-medium flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700 mt-0.5" />
                <span>
                  Once saved, this category immediately syncs to the <strong>{newCatRole === "seller" ? "Farmer / Seller" : "Mandi Buyer"}</strong> Onboarding Form!
                </span>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-bold shadow-md hover:shadow-emerald-950/20 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: CREATE SUBCATEGORY                               */}
      {/* ======================================================== */}
      {showAddSubcatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            {/* Top Green Accent Ribbon */}
            <div className="h-2 w-full bg-gradient-to-r from-[#174B35] via-emerald-500 to-[#174B35]" />

            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#174B35] shadow-xs">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">Create Subcategory</h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Adds a specific crop or commodity under a category
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSubcatModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubcategory} className="p-6 space-y-4 text-xs">
              {/* Role Toggle */}
              <div>
                <label className="block text-[11px] font-bold text-gray-800 tracking-wide uppercase mb-1.5">Target Form</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubcatRole("seller");
                      setSubcatParentId(sellerCats[0]?.id || "");
                    }}
                    className={`py-2 px-3 rounded-xl font-bold border text-xs transition-all cursor-pointer ${
                      subcatRole === "seller"
                        ? "bg-[#174B35] text-white border-[#174B35] shadow-sm"
                        : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    Farmer / Seller
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSubcatRole("buyer");
                      setSubcatParentId(buyerCats[0]?.id || "");
                    }}
                    className={`py-2 px-3 rounded-xl font-bold border text-xs transition-all cursor-pointer ${
                      subcatRole === "buyer"
                        ? "bg-[#174B35] text-white border-[#174B35] shadow-sm"
                        : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    Mandi Buyer
                  </button>
                </div>
              </div>

              {/* Parent Category Selection */}
              <div>
                <label className="block text-[11px] font-bold text-gray-800 tracking-wide uppercase mb-1.5">
                  Parent Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={subcatParentId}
                  onChange={(e) => setSubcatParentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 hover:border-gray-400 rounded-xl text-gray-900 font-semibold focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all shadow-2xs"
                >
                  {(subcatRole === "seller" ? sellerCats : buyerCats).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory Name */}
              <div>
                <label className="block text-[11px] font-bold text-gray-800 tracking-wide uppercase mb-1.5">
                  Subcategory Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Country Jaggery Powder"
                  value={subcatName}
                  onChange={(e) => setSubcatName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 hover:border-gray-400 rounded-xl text-gray-900 font-semibold placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all shadow-2xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddSubcatModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-bold shadow-md hover:shadow-emerald-950/20 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Subcategory</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: EDIT CATEGORY                                    */}
      {/* ======================================================== */}
      {showEditCatModal && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            {/* Top Green Accent Ribbon */}
            <div className="h-2 w-full bg-gradient-to-r from-[#174B35] via-emerald-500 to-[#174B35]" />

            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#174B35] shadow-xs">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">Edit Category</h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Update taxonomy and subcategories for &quot;{editingCategory.name}&quot;
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditCatModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-800 tracking-wide uppercase mb-1.5">Category Name</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 hover:border-gray-400 rounded-xl text-gray-900 font-semibold focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-800 tracking-wide uppercase mb-1.5">
                  Subcategories (comma separated)
                </label>
                <textarea
                  rows={4}
                  value={editingCategory.subcategoriesStr}
                  onChange={(e) =>
                    setEditingCategory((prev) => ({ ...prev, subcategoriesStr: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 hover:border-gray-400 rounded-xl text-gray-900 font-medium focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all shadow-2xs leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditCatModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-bold shadow-md hover:shadow-emerald-950/20 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Configuration Modals (Grades, Statuses, Attributes) */}
      {gradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-sm w-full p-5 space-y-4">
            <h4 className="text-sm font-bold text-gray-900">Configure Quality Grades</h4>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {grades.map((g) => (
                  <span key={g} className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-semibold">
                    {g}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  placeholder="New Grade (e.g. Export Superior)"
                  value={newGradeInput}
                  onChange={(e) => setNewGradeInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newGradeInput.trim()) {
                      setGrades([...grades, newGradeInput.trim()]);
                      setNewGradeInput("");
                    }
                  }}
                  className="px-3 py-1.5 bg-[#174B35] text-white text-xs font-bold rounded-lg"
                >
                  Add
                </button>
              </div>
            </div>
            <div className="text-right">
              <button
                type="button"
                onClick={() => setGradeModal(false)}
                className="px-4 py-1.5 bg-gray-200 text-gray-800 text-xs font-bold rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-sm w-full p-5 space-y-4">
            <h4 className="text-sm font-bold text-gray-900">Configure Availability Statuses</h4>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {statuses.map((st) => (
                  <span key={st} className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-semibold">
                    {st}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  placeholder="New Status"
                  value={newStatusInput}
                  onChange={(e) => setNewStatusInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newStatusInput.trim()) {
                      setStatuses([...statuses, newStatusInput.trim()]);
                      setNewStatusInput("");
                    }
                  }}
                  className="px-3 py-1.5 bg-[#174B35] text-white text-xs font-bold rounded-lg"
                >
                  Add
                </button>
              </div>
            </div>
            <div className="text-right">
              <button
                type="button"
                onClick={() => setStatusModal(false)}
                className="px-4 py-1.5 bg-gray-200 text-gray-800 text-xs font-bold rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {attributeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-sm w-full p-5 space-y-4">
            <h4 className="text-sm font-bold text-gray-900">Custom Attributes Benchmark</h4>
            <div className="space-y-2">
              {attributes.map((a, i) => (
                <div key={i} className="p-2 rounded bg-gray-50 text-xs">
                  <div className="font-bold text-gray-800">{a.name}</div>
                  <div className="text-gray-500 text-[11px]">{a.values}</div>
                </div>
              ))}
            </div>
            <div className="text-right">
              <button
                type="button"
                onClick={() => setAttributeModal(false)}
                className="px-4 py-1.5 bg-gray-200 text-gray-800 text-xs font-bold rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

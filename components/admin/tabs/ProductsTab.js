"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Tag,
  Edit2,
  Check,
  Trash2,
  PackageCheck,
  Plus,
  Eye,
  X,
  Store,
  MapPin,
  Maximize2,
  Layers,
  Scale,
  ReceiptIndianRupee,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { getSellerCategories } from "@/services/categoryStorage";
import { DEFAULT_CORE_CATEGORIES } from "@/data/adminPortalData";

export const TAMIL_NADU_DISTRICTS = [
  "Coimbatore",
  "Thanjavur",
  "Madurai",
  "Erode",
  "Tiruppur",
  "Salem",
  "Dindigul",
  "Tiruchirappalli",
  "Tirunelveli",
  "Dharmapuri",
  "Krishnagiri",
  "Theni",
  "Virudhunagar",
  "Namakkal",
  "Karur",
  "Cuddalore",
  "Villupuram",
  "Kallakurichi",
  "Tiruvannamalai",
  "Vellore",
  "Ranipet",
  "Tirupathur",
  "Kanchipuram",
  "Chengalpattu",
  "Thiruvallur",
  "Chennai",
  "Nagapattinam",
  "Mayiladuthurai",
  "Tiruvarur",
  "Pudukkottai",
  "Sivagangai",
  "Ramanathapuram",
  "Thoothukudi",
  "Tenkasi",
  "Kanniyakumari",
  "Nilgiris",
  "Ariyalur",
  "Perambalur",
];

export const PRODUCT_STATUS_TABS = [
  "All",
  "Published",
  "Approved",
  "Under Review",
  "Draft",
  "Rejected",
  "Inactive",
];

export default function ProductsTab({
  products = [],
  setProducts,
  sellers = [],
  onLogAction,
  onNotify,
}) {
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(products[0] || null);

  // Dedicated Product Full View Card Modal State
  const [fullViewProduct, setFullViewProduct] = useState(null);

  // Dynamic Live Categories Sync
  const [categoriesList, setCategoriesList] = useState(() => {
    try {
      const fromStore = getSellerCategories();
      if (fromStore && fromStore.length > 0) return fromStore.map((c) => c.name);
    } catch (e) {}
    return DEFAULT_CORE_CATEGORIES.map((c) => c.name);
  });

  useEffect(() => {
    const handleCategoriesUpdate = () => {
      try {
        const fromStore = getSellerCategories();
        if (fromStore && fromStore.length > 0) {
          setCategoriesList(fromStore.map((c) => c.name));
        }
      } catch (e) {}
    };
    window.addEventListener("ulavan_categories_updated", handleCategoriesUpdate);
    return () =>
      window.removeEventListener("ulavan_categories_updated", handleCategoriesUpdate);
  }, []);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [editFormError, setEditFormError] = useState("");

  // Add Product Listing Modal State (Zero Static Pre-fills)
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [newProdData, setNewProdData] = useState({
    title: "",
    seller: "",
    customSeller: "",
    category: "",
    variety: "",
    grade: "Grade A Export Quality",
    moq: "",
    price: "",
    district: "Coimbatore",
    certifications: "",
  });

  const handleOpenAddModal = () => {
    setFormError("");
    setNewProdData({
      title: "",
      seller: "",
      customSeller: "",
      category: "",
      variety: "",
      grade: "Grade A Export Quality",
      moq: "",
      price: "",
      district: "Coimbatore",
      certifications: "",
    });
    setAddModalOpen(true);
  };

  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.seller?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.variety?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab =
      activeTab === "All" || prod.status?.toLowerCase() === activeTab.toLowerCase();
    return matchesSearch && matchesTab;
  });

  const handleUpdateStatus = (id, newStatus) => {
    let title = "";
    if (setProducts) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          title = p.title;
          return { ...p, status: newStatus };
        })
      );
    }
    if (selectedProduct?.id === id) {
      setSelectedProduct((prev) => ({ ...prev, status: newStatus }));
    }
    if (fullViewProduct?.id === id) {
      setFullViewProduct((prev) => ({ ...prev, status: newStatus }));
    }
    if (onLogAction)
      onLogAction(
        `Product ${newStatus}`,
        `Listing "${title || id}" transitioned to ${newStatus}.`
      );
    if (onNotify) onNotify(`Product "${title || id}" marked as ${newStatus}`);
  };

  const handleRemoveProduct = (id) => {
    const prodToRemove = products.find((p) => p.id === id);
    if (
      !confirm(
        `Are you sure you want to remove listing "${prodToRemove?.title || id}"?`
      )
    )
      return;

    if (setProducts) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
    if (selectedProduct?.id === id) {
      setSelectedProduct(products.find((p) => p.id !== id) || null);
    }
    if (fullViewProduct?.id === id) {
      setFullViewProduct(null);
    }
    if (onLogAction)
      onLogAction(
        "Product Removed",
        `Removed listing "${prodToRemove?.title || id}".`
      );
    if (onNotify) onNotify(`Listing "${prodToRemove?.title || id}" removed.`);
  };

  const handleOpenEdit = (prod) => {
    setEditFormError("");
    setEditFormData({ ...prod });
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editFormData) return;
    if (!editFormData.title?.trim()) {
      setEditFormError("Produce listing title cannot be empty.");
      return;
    }
    if (!editFormData.price?.trim()) {
      setEditFormError("Direct farmer price cannot be empty.");
      return;
    }
    if (!editFormData.moq?.trim()) {
      setEditFormError("Minimum Order Quantity (MOQ) cannot be empty.");
      return;
    }

    if (setProducts) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editFormData.id ? { ...editFormData } : p))
      );
    }
    if (selectedProduct?.id === editFormData.id) {
      setSelectedProduct({ ...editFormData });
    }
    if (fullViewProduct?.id === editFormData.id) {
      setFullViewProduct({ ...editFormData });
    }
    setEditModalOpen(false);
    if (onLogAction)
      onLogAction(
        "Product Specifications Modified",
        `Edited details for "${editFormData.title}".`
      );
    if (onNotify)
      onNotify(`Product specifications for "${editFormData.title}" updated.`);
  };

  const handleAddNewProduct = () => {
    setFormError("");
    const title = newProdData.title.trim();
    const finalSeller =
      newProdData.seller === "custom"
        ? newProdData.customSeller.trim()
        : newProdData.seller.trim();
    const category = newProdData.category.trim();
    const price = newProdData.price.trim();
    const moq = newProdData.moq.trim();

    if (!title) {
      setFormError("Please enter the agricultural produce / item name.");
      return;
    }
    if (!finalSeller) {
      setFormError("Please select or specify the associated cultivator or farm.");
      return;
    }
    if (!category) {
      setFormError("Please choose a produce category.");
      return;
    }
    if (!moq) {
      setFormError("Please enter the minimum order quantity (e.g. 50 kg or 1 Tonne).");
      return;
    }
    if (!price) {
      setFormError("Please enter the direct farmer price (e.g. ₹140 / kg).");
      return;
    }

    const newRecord = {
      id: `PRD-${Date.now().toString().slice(-4)}`,
      title,
      seller: finalSeller,
      category,
      variety: newProdData.variety.trim() || "Traditional Native Produce",
      grade: newProdData.grade || "Grade A Export Quality",
      moq,
      price: price.startsWith("₹") ? price : `₹${price}`,
      status: "Published",
      district: newProdData.district || "Coimbatore",
      location: `${newProdData.district || "Coimbatore"}, Tamil Nadu`,
      certifications:
        newProdData.certifications.trim() || "Verified by Platform Quality Desk",
      dateAdded: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };

    if (setProducts) {
      setProducts((prev) => [newRecord, ...prev]);
    }
    setSelectedProduct(newRecord);
    setAddModalOpen(false);
    setNewProdData({
      title: "",
      seller: "",
      customSeller: "",
      category: "",
      variety: "",
      grade: "Grade A Export Quality",
      moq: "",
      price: "",
      district: "Coimbatore",
      certifications: "",
    });
    if (onLogAction)
      onLogAction(
        "Product Created",
        `Published new agricultural listing "${newRecord.title}".`
      );
    if (onNotify)
      onNotify(`Listing "${newRecord.title}" published to marketplace.`);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header Bar: Status Filter Tabs & Layout View Switcher */}
      <div className="bg-white p-2.5 sm:p-3 rounded-3xl border border-gray-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {PRODUCT_STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab;
            const count =
              tab === "All"
                ? products.length
                : products.filter(
                    (p) => p.status?.toLowerCase() === tab.toLowerCase()
                  ).length;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  if (onNotify) onNotify(`Filtered: ${tab} listings`);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? "bg-[#174B35] text-white shadow-sm shadow-emerald-950/20 scale-[1.02]"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isActive ? "bg-white/20 text-white" : "bg-gray-200/80 text-gray-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Status Summary Tag */}
        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-50/90 px-3.5 py-1.5 rounded-xl border border-gray-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Click any listing row to open the complete specification card</span>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-gray-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by produce name, cultivator, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174B35]/20 focus:border-[#174B35]"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-sm hover:shadow-emerald-950/20 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Listing</span>
          </button>

          <span className="text-xs text-gray-400 font-semibold hidden sm:inline">
            {filteredProducts.length} Results
          </span>
        </div>
      </div>

      {/* Empty State */}
      {products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#E8F0E3] text-[#174B35] mx-auto flex items-center justify-center">
            <PackageCheck className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-extrabold text-gray-900">
              No Produce Listings Found
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              No agricultural listings match your current filters. Add a new farm harvest lot or adjust your search filter.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Produce Listing</span>
          </button>
        </div>
      ) : (
        <div className="w-full">
          {/* Main Listings Table - Full Width */}
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs overflow-hidden w-full">
            {/* Table Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#174B35] shrink-0 shadow-2xs">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-gray-900 flex items-center gap-2">
                    <span>Agricultural Produce Directory</span>
                    <span className="text-xs font-bold text-[#174B35] bg-[#E8F0E3] px-2.5 py-0.5 rounded-full border border-[#729B59]/30">
                      {filteredProducts.length} Listings
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Click any produce row to open the complete specification card and inspection dossier
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Interactive Row Inspection</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 pl-6 pr-4 w-[36%]">Produce &amp; Pricing</th>
                    <th className="py-3.5 px-4 w-[24%]">Cultivator / Farm</th>
                    <th className="py-3.5 px-4 w-[16%]">Category</th>
                    <th className="py-3.5 px-4 w-[12%]">Status</th>
                    <th className="py-3.5 pr-6 pl-4 w-[12%] text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((prod) => {
                    const isPublished = prod.status === "Published";
                    const isRejected = prod.status === "Rejected";

                    return (
                      <tr
                        key={prod.id}
                        onClick={() => setFullViewProduct(prod)}
                        className="hover:bg-[#E8F0E3]/40 transition-all cursor-pointer group"
                      >
                        {/* 1. Product & Pricing Column */}
                        <td className="py-4 pl-6 pr-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100 bg-emerald-50/80 text-[#174B35] group-hover:bg-[#174B35] group-hover:text-white transition-all shadow-2xs">
                              <PackageCheck className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-[#174B35] leading-snug transition-colors">
                                {prod.title}
                              </div>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className="font-extrabold text-[11px] text-[#174B35] bg-[#E8F0E3] px-2.5 py-0.5 rounded-md border border-[#729B59]/30 whitespace-nowrap">
                                  {prod.price}
                                </span>
                                <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                                  MOQ: <strong className="text-gray-700">{prod.moq}</strong>
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Cultivator Column */}
                        <td className="py-4 px-4">
                          <div className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span className="truncate max-w-[220px]">{prod.seller}</span>
                          </div>
                          <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                            <span>{prod.location || prod.district || "Tamil Nadu"}</span>
                          </div>
                        </td>

                        {/* 3. Category Column */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-emerald-50/80 text-emerald-800 border border-emerald-200/60 inline-flex items-center gap-1">
                            <Tag className="w-3 h-3 text-emerald-600" />
                            <span>{prod.category}</span>
                          </span>
                        </td>

                        {/* 4. Status Column */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                              isPublished
                                ? "bg-emerald-100/90 text-emerald-800 border border-emerald-300"
                                : prod.status === "Approved"
                                ? "bg-blue-100/90 text-blue-800 border border-blue-300"
                                : prod.status === "Under Review" ||
                                  prod.status === "Submitted"
                                ? "bg-amber-100/90 text-amber-800 border border-amber-300"
                                : "bg-rose-100/90 text-rose-800 border border-rose-300"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{prod.status}</span>
                          </span>
                        </td>

                        {/* 5. Minimalist Clean Icon Actions Column */}
                        <td className="py-4 pr-6 pl-4 text-right whitespace-nowrap">
                          <div
                            className="flex items-center justify-end gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              title="Inspect Full Product Card"
                              onClick={() => setFullViewProduct(prod)}
                              className="w-7 h-7 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-[#174B35] hover:bg-[#E8F0E3] hover:border-[#729B59]/40 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              title="Edit Specifications"
                              onClick={() => handleOpenEdit(prod)}
                              className="w-7 h-7 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-200 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {!isPublished && (
                              <button
                                type="button"
                                title="Approve & Publish Listing"
                                onClick={() => handleUpdateStatus(prod.id, "Published")}
                                className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-[#174B35] hover:text-white flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {!isRejected && (
                              <button
                                type="button"
                                title="Reject Listing"
                                onClick={() => handleUpdateStatus(prod.id, "Rejected")}
                                className="w-7 h-7 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              title="Remove Listing"
                              onClick={() => handleRemoveProduct(prod.id)}
                              className="w-7 h-7 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 bg-gray-50/80 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between px-6">
              <span>Click on any produce listing to open the complete specification card.</span>
              <span className="font-bold text-[#174B35]">
                {filteredProducts.length} Items Listed
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🚀 PRODUCT FULL VIEW CARD MODAL (REQUESTED BY USER)     */}
      {/* ======================================================== */}
      {fullViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-2xl w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F0E3] text-[#174B35] border border-[#729B59]/40">
                    {fullViewProduct.category}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      fullViewProduct.status === "Published"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : fullViewProduct.status === "Approved"
                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                        : fullViewProduct.status === "Under Review"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-red-100 text-red-800 border border-red-200"
                    }`}
                  >
                    &bull; {fullViewProduct.status}
                  </span>
                  <span className="text-[11px] font-mono text-gray-400">
                    {fullViewProduct.id}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  {fullViewProduct.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setFullViewProduct(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Farm & Commercial Highlight Hero Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#174B35] to-[#0E2F21] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
              <div className="space-y-1">
                <div className="text-[11px] uppercase tracking-wider text-emerald-200 font-bold flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5" />
                  <span>Associated Producer / Farm</span>
                </div>
                <h4 className="text-base sm:text-lg font-black">{fullViewProduct.seller}</h4>
                <div className="text-xs text-emerald-100/90 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-300" />
                  <span>
                    {fullViewProduct.location || fullViewProduct.district || "Tamil Nadu"} &bull; Direct Farm Producer
                  </span>
                </div>
              </div>

              <div className="sm:text-right shrink-0 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15">
                <div className="text-[10px] uppercase font-bold text-emerald-200">
                  Direct Farmer Price
                </div>
                <div className="text-2xl font-black text-white">{fullViewProduct.price}</div>
                <div className="text-[11px] text-emerald-200">
                  MOQ: {fullViewProduct.moq}
                </div>
              </div>
            </div>

            {/* Detailed Technical Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Variety</span>
                <span className="font-extrabold text-gray-900 block mt-1">
                  {fullViewProduct.variety || "Local Native Heritage"}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Quality Grade</span>
                <span className="font-extrabold text-[#174B35] block mt-1">
                  {fullViewProduct.grade}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Lot Packaging</span>
                <span className="font-extrabold text-gray-900 block mt-1">
                  Jute Bags / Food Grade
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Moisture Ratio</span>
                <span className="font-extrabold text-gray-900 block mt-1">
                  &lt; 12% Sun-dried
                </span>
              </div>
            </div>

            {/* Certifications & Quality Compliance Section */}
            <div className="p-4 rounded-2xl bg-[#E8F0E3]/70 border border-[#729B59]/40 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-[#174B35] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#174B35]" />
                  <span>Accreditation &amp; Certifications</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-[#729B59]/40">
                  Government Verified
                </span>
              </div>
              <p className="font-bold text-gray-900">
                {fullViewProduct.certifications}
              </p>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Physical land documents (Patta/Chitta) and agricultural certification verified manually by Platform Administration. 0% middleman brokerage guarantee.
              </p>
            </div>

            {/* Administrative Action Bar inside the Full Card */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleRemoveProduct(fullViewProduct.id);
                  }}
                  className="px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-bold border border-red-200 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Listing</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleOpenEdit(fullViewProduct);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {fullViewProduct.status !== "Published" && (
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateStatus(fullViewProduct.id, "Published");
                    }}
                    className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Publish Listing</span>
                  </button>
                )}

                {fullViewProduct.status !== "Rejected" && (
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateStatus(fullViewProduct.id, "Rejected");
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-200 transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setFullViewProduct(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* Create Agricultural Produce Listing Modal                */}
      {/* ======================================================== */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            {/* Top Green Accent Ribbon */}
            <div className="h-2 w-full bg-gradient-to-r from-[#174B35] via-emerald-500 to-[#174B35]" />

            {/* Header */}
            <div className="px-6 py-5 bg-white border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#174B35] shadow-xs">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                    <span>Create Produce Listing</span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#174B35] border border-emerald-200/80">
                      Marketplace
                    </span>
                  </h4>
                  <p className="text-xs text-gray-500 font-medium">
                    Publish verified farm harvest directly to statewide mandi buyers
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-all cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 space-y-4.5 max-h-[75vh] overflow-y-auto text-xs">
              {formError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-800 font-bold animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Produce Title */}
              <div>
                <label className="block text-[11px] font-bold text-gray-800 tracking-wide uppercase mb-1.5">
                  Produce / Item Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Organic Traditional Karuppu Kavuni Black Rice"
                  value={newProdData.title}
                  onChange={(e) => {
                    setNewProdData({ ...newProdData, title: e.target.value });
                    if (formError) setFormError("");
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all shadow-2xs"
                />
              </div>

              {/* Cultivator & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 tracking-wide uppercase mb-1.5">
                    Cultivator / Seller <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newProdData.seller}
                    onChange={(e) => {
                      const selectedVal = e.target.value;
                      const matchedSeller = sellers.find(
                        (s) => s.businessName === selectedVal
                      );
                      setNewProdData({
                        ...newProdData,
                        seller: selectedVal,
                        district: matchedSeller?.district || newProdData.district,
                      });
                      if (formError) setFormError("");
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all shadow-2xs"
                  >
                    <option value="">-- Choose Registered Cultivator --</option>
                    {sellers.map((s) => (
                      <option key={s.id} value={s.businessName}>
                        {s.businessName} ({s.district || "TN"})
                      </option>
                    ))}
                    <option value="custom">+ Other / Custom Cultivator</option>
                  </select>
                  {newProdData.seller === "custom" && (
                    <input
                      type="text"
                      placeholder="Enter Farm / Cultivator Name"
                      value={newProdData.customSeller}
                      onChange={(e) =>
                        setNewProdData({
                          ...newProdData,
                          customSeller: e.target.value,
                        })
                      }
                      className="mt-2 w-full px-3.5 py-2 rounded-xl bg-white border border-[#174B35]/40 text-xs font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#174B35]/20 shadow-2xs"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 tracking-wide uppercase mb-1.5">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newProdData.category}
                    onChange={(e) => {
                      setNewProdData({ ...newProdData, category: e.target.value });
                      if (formError) setFormError("");
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all shadow-2xs"
                  >
                    <option value="">-- Select Produce Category --</option>
                    {categoriesList.map((catName) => (
                      <option key={catName} value={catName}>
                        {catName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Commercials Card Section (Price & MOQ Highlight) */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-[#174B35] uppercase tracking-wider flex items-center gap-1.5">
                    <ReceiptIndianRupee className="w-3.5 h-3.5 text-[#174B35]" />
                    <span>Commercial &amp; Minimum Lot Terms</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-900 bg-white px-2 py-0.5 rounded-full border border-emerald-200/80">
                    Direct Farm Gate
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-800 tracking-wide uppercase mb-1.5">
                      Minimum Order Qty (MOQ) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 100 kg or 2 Tonnes"
                      value={newProdData.moq}
                      onChange={(e) => {
                        setNewProdData({ ...newProdData, moq: e.target.value });
                        if (formError) setFormError("");
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-800 tracking-wide uppercase mb-1.5">
                      Direct Farmer Price <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ₹140 / kg or ₹28 / kg"
                      value={newProdData.price}
                      onChange={(e) => {
                        setNewProdData({ ...newProdData, price: e.target.value });
                        if (formError) setFormError("");
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-extrabold text-[#174B35] placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Variety & Quality Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 tracking-wide uppercase mb-1.5">
                    Crop Variety / Origin
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Karuppu Kavuni Heritage"
                    value={newProdData.variety}
                    onChange={(e) =>
                      setNewProdData({ ...newProdData, variety: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 tracking-wide uppercase mb-1.5">
                    Quality Grade
                  </label>
                  <select
                    value={newProdData.grade}
                    onChange={(e) =>
                      setNewProdData({ ...newProdData, grade: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all shadow-2xs"
                  >
                    <option value="Grade A Export Quality">Grade A Export Quality</option>
                    <option value="Grade A Sun-Dried (&lt;12% Moisture)">
                      Grade A Sun-Dried (&lt;12% Moisture)
                    </option>
                    <option value="Grade A First Press Cold Extraction">
                      Grade A First Press Cold Extraction
                    </option>
                    <option value="Grade A Fresh Early Harvest">
                      Grade A Fresh Early Harvest
                    </option>
                    <option value="Grade B Standard Mandi Lot">
                      Grade B Standard Mandi Lot
                    </option>
                    <option value="Grade C Bulk Processing Lot">
                      Grade C Bulk Processing Lot
                    </option>
                  </select>
                </div>
              </div>

              {/* District & Certifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 tracking-wide uppercase mb-1.5">
                    Origin District (Tamil Nadu)
                  </label>
                  <select
                    value={newProdData.district}
                    onChange={(e) =>
                      setNewProdData({ ...newProdData, district: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all shadow-2xs"
                  >
                    {TAMIL_NADU_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 tracking-wide uppercase mb-1.5">
                    Certification / Proof
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TNOCD Certified / FSSAI / Tested Pesticide Free"
                    value={newProdData.certifications}
                    onChange={(e) =>
                      setNewProdData({
                        ...newProdData,
                        certifications: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200/80">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Instant live sync to marketplace</span>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddNewProduct}
                  className="px-6 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-md hover:shadow-emerald-950/20 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>Publish Listing</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* Edit Product Modal                                       */}
      {/* ======================================================== */}
      {editModalOpen && editFormData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            {/* Top Green Accent Ribbon */}
            <div className="h-2 w-full bg-gradient-to-r from-[#174B35] via-emerald-500 to-[#174B35]" />

            {/* Header */}
            <div className="px-6 py-5 bg-white border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#174B35] shadow-xs">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                    <span>Edit Produce Listing</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      {editFormData.id}
                    </span>
                  </h4>
                  <p className="text-xs text-gray-500 font-medium">
                    Update listing specifications and farm commercial terms
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-all cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 space-y-4.5 max-h-[75vh] overflow-y-auto text-xs">
              {editFormError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-800 font-bold animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{editFormError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-[11px] font-bold text-gray-800 tracking-wide uppercase mb-1.5">
                  Produce / Item Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.title || ""}
                  onChange={(e) => {
                    setEditFormData({ ...editFormData, title: e.target.value });
                    if (editFormError) setEditFormError("");
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all shadow-2xs"
                />
              </div>

              {/* Seller & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 tracking-wide uppercase mb-1.5">
                    Cultivator / Seller <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.seller || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, seller: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 tracking-wide uppercase mb-1.5">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editFormData.category || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, category: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all shadow-2xs"
                  >
                    {categoriesList.map((catName) => (
                      <option key={catName} value={catName}>
                        {catName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Commercials Card Section (Price & MOQ Highlight) */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-[#174B35] uppercase tracking-wider flex items-center gap-1.5">
                    <ReceiptIndianRupee className="w-3.5 h-3.5 text-[#174B35]" />
                    <span>Commercial &amp; Minimum Lot Terms</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-900 bg-white px-2 py-0.5 rounded-full border border-emerald-200/80">
                    Direct Farm Gate
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-800 tracking-wide uppercase mb-1.5">
                      Minimum Order Qty (MOQ) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.moq || ""}
                      onChange={(e) => {
                        setEditFormData({ ...editFormData, moq: e.target.value });
                        if (editFormError) setEditFormError("");
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-800 tracking-wide uppercase mb-1.5">
                      Direct Farmer Price <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.price || ""}
                      onChange={(e) => {
                        setEditFormData({ ...editFormData, price: e.target.value });
                        if (editFormError) setEditFormError("");
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-extrabold text-[#174B35] focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Variety & Quality Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 tracking-wide uppercase mb-1.5">
                    Crop Variety / Origin
                  </label>
                  <input
                    type="text"
                    value={editFormData.variety || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, variety: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 tracking-wide uppercase mb-1.5">
                    Quality Grade
                  </label>
                  <input
                    type="text"
                    value={editFormData.grade || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, grade: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* District & Certifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 tracking-wide uppercase mb-1.5">
                    Origin District (Tamil Nadu)
                  </label>
                  <select
                    value={editFormData.district || "Coimbatore"}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        district: e.target.value,
                        location: `${e.target.value}, Tamil Nadu`,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all shadow-2xs"
                  >
                    {TAMIL_NADU_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 tracking-wide uppercase mb-1.5">
                    Certification / Proof
                  </label>
                  <input
                    type="text"
                    value={editFormData.certifications || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        certifications: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-6 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-md hover:shadow-emerald-950/20 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

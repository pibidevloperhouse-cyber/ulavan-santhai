"use client";

import React, { useState } from "react";
import { Search, Filter, CheckCircle2, XCircle, AlertCircle, Eye, FileText, Edit2, Check, Store, Plus, MapPin, X, Shield, Phone, CreditCard, Sparkles } from "lucide-react";

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

export default function SellersTab({ sellers = [], setSellers, onLogAction, onNotify }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedSeller, setSelectedSeller] = useState(sellers[0] || null);
  const [fullViewSeller, setFullViewSeller] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [editFormError, setEditFormError] = useState("");

  // Add New Seller Modal State (Zero Static Pre-fills)
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [newSellerData, setNewSellerData] = useState({
    businessName: "",
    sellerType: "Direct Cultivator",
    contactName: "",
    phone: "",
    district: "Coimbatore",
    address: "",
    productsOffered: "",
  });

  const handleOpenAddModal = () => {
    setFormError("");
    setNewSellerData({
      businessName: "",
      sellerType: "Direct Cultivator",
      contactName: "",
      phone: "",
      district: "Coimbatore",
      address: "",
      productsOffered: "",
    });
    setAddModalOpen(true);
  };

  const filteredSellers = sellers.filter((seller) => {
    const matchesSearch =
      seller.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.sellerType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.district?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ||
      seller.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (id, newStatus) => {
    if (setSellers) {
      setSellers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      );
    }
    if (selectedSeller?.id === id) {
      setSelectedSeller((prev) => ({ ...prev, status: newStatus }));
    }
    const currentName = selectedSeller?.businessName || id;
    if (onLogAction) onLogAction(`Seller ${newStatus}`, `Marked "${currentName}" as ${newStatus}.`);
    if (onNotify) onNotify(`Seller "${currentName}" marked as ${newStatus}`);
  };

  const handleOpenEdit = (seller) => {
    setEditFormError("");
    setEditFormData({ ...seller });
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editFormData) return;
    if (!editFormData.businessName?.trim()) {
      setEditFormError("Business / farm name cannot be empty.");
      return;
    }
    if (!editFormData.phone?.trim()) {
      setEditFormError("Contact mobile phone cannot be empty.");
      return;
    }

    if (setSellers) {
      setSellers((prev) =>
        prev.map((s) => (s.id === editFormData.id ? { ...editFormData } : s))
      );
    }
    if (selectedSeller?.id === editFormData.id) {
      setSelectedSeller({ ...editFormData });
    }
    if (fullViewSeller?.id === editFormData.id) {
      setFullViewSeller({ ...editFormData });
    }
    setEditModalOpen(false);
    if (onLogAction)
      onLogAction(
        "Seller Profile Modified",
        `Updated details for "${editFormData.businessName}".`
      );
    if (onNotify)
      onNotify(`Seller profile for "${editFormData.businessName}" saved.`);
  };

  const handleAddNewSeller = () => {
    setFormError("");
    const businessName = newSellerData.businessName.trim();
    const contactName = newSellerData.contactName.trim();
    const phone = newSellerData.phone.trim();
    const district = newSellerData.district || "Coimbatore";
    const address =
      newSellerData.address.trim() || `${district}, Tamil Nadu`;
    const productsOffered =
      newSellerData.productsOffered.trim() || "Fresh Agricultural Harvest";

    if (!businessName) {
      setFormError("Please enter the cultivator / business name.");
      return;
    }
    if (!phone) {
      setFormError("Please enter the contact mobile phone number.");
      return;
    }

    const newRecord = {
      id: `SEL-${String(sellers.length + 1).padStart(3, "0")}`,
      businessName,
      sellerType: newSellerData.sellerType,
      contactName: contactName || "Primary Cultivator",
      phone,
      district,
      subscription: "Active (₹365/Yr)",
      status: "Approved",
      address,
      productsOffered,
      certifications: [
        {
          name: "Patta / Land Document",
          number: `TN-${district.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
          authority: "Govt of Tamil Nadu",
          validity: "Permanent",
        },
      ],
    };

    if (setSellers) {
      setSellers((prev) => [newRecord, ...prev]);
    }
    setSelectedSeller(newRecord);
    setAddModalOpen(false);
    setNewSellerData({
      businessName: "",
      sellerType: "Direct Cultivator",
      contactName: "",
      phone: "",
      district: "Coimbatore",
      address: "",
      productsOffered: "",
    });
    if (onLogAction)
      onLogAction(
        "Seller Enrolled",
        `Enrolled new seller/cultivator "${newRecord.businessName}".`
      );
    if (onNotify)
      onNotify(`Cultivator "${newRecord.businessName}" registered successfully.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search sellers by business name, type, or district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174B35]/20 focus:border-[#174B35]"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-3.5 py-2 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Seller</span>
          </button>

          <Filter className="w-4 h-4 text-gray-500 ml-1" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174B35]/20 cursor-pointer text-[#174B35]"
          >
            <option value="All">All Statuses ({sellers.length})</option>
            <option value="Approved">Approved</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Main Content: If no sellers exist, show clean Empty State */}
      {sellers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#E8F0E3] text-[#174B35] mx-auto flex items-center justify-center">
            <Store className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-extrabold text-gray-900">No Sellers Registered Yet</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Cultivator and direct farm producer registrations will appear here for verification. You can also manually add a producer account below.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Register First Seller</span>
          </button>
        </div>
      ) : (
        <div className="w-full">
          {/* Sellers Table - 100% Full Width */}
          <div className="w-full bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-200/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Seller List ({filteredSellers.length})
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Click any cultivator row to open the complete profile card &amp; land records</p>
              </div>
              <span className="text-xs font-bold text-[#174B35] bg-[#E8F0E3] px-2.5 py-1 rounded-lg border border-[#729B59]/30">
                {sellers.length} Active {sellers.length === 1 ? "Record" : "Records"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200/80 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-3.5 pl-6">Business Name</th>
                    <th className="p-3.5">Seller Type</th>
                    <th className="p-3.5">Contact</th>
                    <th className="p-3.5">Subscription</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSellers.map((seller) => {
                    return (
                      <tr
                        key={seller.id}
                        onClick={() => setFullViewSeller(seller)}
                        className="hover:bg-[#E8F0E3]/40 transition-all cursor-pointer group"
                      >
                        <td className="p-3.5 pl-5">
                          <div className="font-extrabold text-gray-900 group-hover:text-[#174B35] transition-colors">{seller.businessName}</div>
                          <div className="text-[11px] text-gray-400 font-mono mt-0.5">{seller.id}</div>
                        </td>

                        <td className="p-3.5">
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#E8F0E3] text-[#174B35] border border-[#729B59]/30">
                            {seller.sellerType}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-gray-900">{seller.contactName}</div>
                          <div className="text-gray-500 text-[11px]">{seller.phone}</div>
                          <div className="text-[10px] text-emerald-800 font-semibold">{seller.district}</div>
                        </td>

                        <td className="p-3.5">
                          <span className="text-[11px] font-bold text-[#174B35]">
                            {seller.subscription}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              seller.status === "Approved"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : seller.status === "Pending Review"
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : "bg-red-100 text-red-800 border border-red-300"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{seller.status}</span>
                          </span>
                        </td>

                        {/* Minimalist Clean Icon Actions */}
                        <td className="p-3.5 text-right pr-5">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {/* Eye: Full View Modal */}
                            <button
                              type="button"
                              title="Inspect Full Seller Dossier"
                              onClick={() => {
                                setSelectedSeller(seller);
                                setFullViewSeller(seller);
                              }}
                              className="p-1.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-[#174B35] hover:bg-[#E8F0E3]/60 hover:border-[#729B59]/40 transition-all shadow-2xs cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Icon */}
                            <button
                              type="button"
                              title="Edit Seller Details"
                              onClick={() => handleOpenEdit(seller)}
                              className="p-1.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-200 transition-all shadow-2xs cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Quick Approve Icon */}
                            {seller.status !== "Approved" && (
                              <button
                                type="button"
                                title="Approve Seller"
                                onClick={() => handleUpdateStatus(seller.id, "Approved")}
                                className="p-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-[#174B35] hover:text-white transition-all shadow-2xs cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Quick Reject Icon */}
                            {seller.status !== "Rejected" && (
                              <button
                                type="button"
                                title="Reject Application"
                                onClick={() => handleUpdateStatus(seller.id, "Rejected")}
                                className="p-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-600 hover:text-white transition-all shadow-2xs cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Suspend / Activate Icon */}
                            <button
                              type="button"
                              title={seller.status === "Suspended" ? "Activate Seller" : "Suspend Seller"}
                              onClick={() =>
                                handleUpdateStatus(
                                  seller.id,
                                  seller.status === "Suspended" ? "Approved" : "Suspended"
                                )
                              }
                              className={`p-1.5 rounded-xl border transition-all shadow-2xs cursor-pointer ${
                                seller.status === "Suspended"
                                  ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-600 hover:text-white"
                                  : "bg-white text-gray-400 border-gray-200 hover:text-amber-700 hover:bg-amber-50"
                              }`}
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
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
              <span>Click on any cultivator row to open the complete profile card.</span>
              <span className="font-bold text-[#174B35]">
                {filteredSellers.length} Cultivators Registered
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* Add New Seller / Cultivator Modal                         */}
      {/* ======================================================== */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            {/* Top Accent Ribbon */}
            <div className="h-2 w-full bg-gradient-to-r from-[#174B35] via-emerald-500 to-[#174B35]" />

            {/* Header */}
            <div className="px-6 py-5 bg-white border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-[#174B35] shadow-xs">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-2">
                    <span>Register New Cultivator</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/70 text-[#174B35]">
                      Direct Seller
                    </span>
                  </h4>
                  <p className="text-xs text-gray-500 font-medium">
                    Onboard genuine farmers, FPOs, and organic producers into the platform
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {formError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 font-semibold animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Farm / Business Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Farm / Business Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kongu Natural Organic Farmers Collective"
                  value={newSellerData.businessName}
                  onChange={(e) => {
                    setNewSellerData({
                      ...newSellerData,
                      businessName: e.target.value,
                    });
                    if (formError) setFormError("");
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all rounded-xl shadow-2xs"
                />
              </div>

              {/* Seller Type & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Seller Classification
                  </label>
                  <select
                    value={newSellerData.sellerType}
                    onChange={(e) =>
                      setNewSellerData({
                        ...newSellerData,
                        sellerType: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all rounded-xl shadow-2xs"
                  >
                    <option value="Direct Cultivator">Direct Cultivator</option>
                    <option value="Organic Producer">Organic Producer</option>
                    <option value="Farmer Producer Org (FPO)">
                      Farmer Producer Org (FPO)
                    </option>
                    <option value="Cooperative Society">Cooperative Society</option>
                    <option value="Agro-Processing Unit">Agro-Processing Unit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Operating District (Tamil Nadu)
                  </label>
                  <select
                    value={newSellerData.district}
                    onChange={(e) =>
                      setNewSellerData({
                        ...newSellerData,
                        district: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all rounded-xl shadow-2xs"
                  >
                    {TAMIL_NADU_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contact Name & Mobile Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Contact Person / Farmer Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. K. Subramanian"
                    value={newSellerData.contactName}
                    onChange={(e) =>
                      setNewSellerData({
                        ...newSellerData,
                        contactName: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all rounded-xl shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Mobile Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98421 12345"
                    value={newSellerData.phone}
                    onChange={(e) => {
                      setNewSellerData({
                        ...newSellerData,
                        phone: e.target.value,
                      });
                      if (formError) setFormError("");
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all rounded-xl shadow-2xs"
                  />
                </div>
              </div>

              {/* Farm Address */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Farm Location / Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. SF No. 128, Thondamuthur Road, Coimbatore"
                  value={newSellerData.address}
                  onChange={(e) =>
                    setNewSellerData({
                      ...newSellerData,
                      address: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all rounded-xl shadow-2xs"
                />
              </div>

              {/* Products Offered */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Primary Agricultural Crops Offered
                </label>
                <input
                  type="text"
                  placeholder="e.g. Traditional Rice, Wood-Pressed Oils, Minor Millets"
                  value={newSellerData.productsOffered}
                  onChange={(e) =>
                    setNewSellerData({
                      ...newSellerData,
                      productsOffered: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all rounded-xl shadow-2xs"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Annual direct trade pass enrolled</span>
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddNewSeller}
                  className="px-5 py-2 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-2"
                >
                  <Store className="w-4 h-4" />
                  <span>Register Cultivator</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* Edit Seller Profile Modal                                 */}
      {/* ======================================================== */}
      {editModalOpen && editFormData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            {/* Top Accent Ribbon */}
            <div className="h-2 w-full bg-gradient-to-r from-[#174B35] via-emerald-500 to-[#174B35]" />

            {/* Header */}
            <div className="px-6 py-5 bg-white border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-[#174B35] shadow-xs">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-2">
                    <span>Edit Cultivator Profile</span>
                  </h4>
                  <p className="text-xs text-gray-500 font-medium truncate max-w-xs">
                    {editFormData.businessName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {editFormError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 font-semibold animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{editFormError}</span>
                </div>
              )}

              {/* Farm / Business Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Business / Farm Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.businessName || ""}
                  onChange={(e) => {
                    setEditFormData({
                      ...editFormData,
                      businessName: e.target.value,
                    });
                    if (editFormError) setEditFormError("");
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all rounded-xl shadow-2xs"
                />
              </div>

              {/* Seller Type & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Seller Classification
                  </label>
                  <input
                    type="text"
                    value={editFormData.sellerType || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        sellerType: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all rounded-xl shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Operating District
                  </label>
                  <select
                    value={editFormData.district || "Coimbatore"}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        district: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all rounded-xl shadow-2xs"
                  >
                    {TAMIL_NADU_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contact Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={editFormData.contactName || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        contactName: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all rounded-xl shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Mobile Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.phone || ""}
                    onChange={(e) => {
                      setEditFormData({
                        ...editFormData,
                        phone: e.target.value,
                      });
                      if (editFormError) setEditFormError("");
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all rounded-xl shadow-2xs"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Address
                </label>
                <input
                  type="text"
                  value={editFormData.address || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      address: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all rounded-xl shadow-2xs"
                />
              </div>

              {/* Products Offered */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Primary Crops Offered
                </label>
                <input
                  type="text"
                  value={editFormData.productsOffered || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      productsOffered: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all rounded-xl shadow-2xs"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Document Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#174B35]" />
                <span>Certificate Verification</span>
              </h4>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-bold text-gray-900 text-sm">{previewDoc.name}</div>
              <div className="text-gray-600">Document No: <span className="font-semibold text-gray-900">{previewDoc.number}</span></div>
              <div className="text-gray-600">Authority: <span className="font-semibold text-gray-900">{previewDoc.authority}</span></div>
              <div className="text-gray-600">Validity: <span className="font-semibold text-[#174B35]">{previewDoc.validity}</span></div>
            </div>

            <div className="p-4 rounded-xl bg-[#E8F0E3]/60 border border-[#729B59]/30 text-center">
              <CheckCircle2 className="w-8 h-8 text-[#174B35] mx-auto mb-1" />
              <p className="text-xs font-bold text-[#174B35]">Verified Document Record</p>
              <p className="text-[11px] text-gray-500">Document matched and verified against official registries.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPreviewDoc(null);
                  if (onNotify) onNotify(`Certificate "${previewDoc.name}" confirmed verified`);
                }}
                className="px-4 py-2 rounded-xl bg-[#174B35] text-white text-xs font-bold hover:bg-[#103A29] cursor-pointer"
              >
                Confirm Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🚀 SELLER FULL VIEW CARD MODAL                           */}
      {/* ======================================================== */}
      {fullViewSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-2xl w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F0E3] text-[#174B35] border border-[#729B59]/40">
                    {fullViewSeller.sellerType}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      fullViewSeller.status === "Approved"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : fullViewSeller.status === "Pending Review"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-red-100 text-red-800 border border-red-200"
                    }`}
                  >
                    &bull; {fullViewSeller.status}
                  </span>
                  <span className="text-[11px] font-mono text-gray-400">
                    {fullViewSeller.id}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  {fullViewSeller.businessName}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setFullViewSeller(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Farm Producer Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#174B35] to-[#0E2F21] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
              <div className="space-y-1">
                <div className="text-[11px] uppercase tracking-wider text-emerald-200 font-bold flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5" />
                  <span>Authorized Producer Dossier</span>
                </div>
                <h4 className="text-base sm:text-lg font-black">{fullViewSeller.contactName}</h4>
                <div className="text-xs text-emerald-100/90 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-300" />
                  <span>{fullViewSeller.phone}</span>
                  <span>&bull;</span>
                  <MapPin className="w-3 h-3 text-emerald-300" />
                  <span>{fullViewSeller.district}, Tamil Nadu</span>
                </div>
              </div>

              <div className="sm:text-right shrink-0 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15">
                <div className="text-[10px] uppercase font-bold text-emerald-200 flex items-center gap-1 justify-end">
                  <CreditCard className="w-3 h-3" />
                  <span>Membership</span>
                </div>
                <div className="text-sm font-black text-white">{fullViewSeller.subscription}</div>
                <div className="text-[10px] text-emerald-200">0% Trade Commission</div>
              </div>
            </div>

            {/* Farm Location & Agricultural Output Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Farm Address</span>
                <span className="font-bold text-gray-800 block">
                  {fullViewSeller.address || `${fullViewSeller.district}, Tamil Nadu`}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Products Offered</span>
                <span className="font-bold text-[#174B35] block">
                  {fullViewSeller.productsOffered || "Direct Harvest Produce"}
                </span>
              </div>
            </div>

            {/* Verification Documents & Land Records */}
            <div className="p-4 rounded-2xl bg-[#E8F0E3]/70 border border-[#729B59]/40 space-y-2 text-xs">
              <span className="font-black text-[#174B35] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#174B35]" />
                <span>Submitted Land &amp; Identity Certificates</span>
              </span>
              <div className="divide-y divide-[#729B59]/20 pt-1">
                {fullViewSeller.certifications?.map((doc, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-gray-900">{doc.name}</div>
                      <div className="text-[11px] text-gray-600">
                        {doc.number} &bull; {doc.authority}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#729B59]/50 text-[#174B35] font-bold text-[11px] hover:bg-[#174B35] hover:text-white transition-colors cursor-pointer"
                    >
                      Inspect Doc
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Administrative Action Bar inside the Full Card */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={() => {
                  handleOpenEdit(fullViewSeller);
                }}
                className="px-3.5 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Seller Dossier</span>
              </button>

              <div className="flex items-center gap-2">
                {fullViewSeller.status !== "Approved" && (
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateStatus(fullViewSeller.id, "Approved");
                      setFullViewSeller((p) => ({ ...p, status: "Approved" }));
                    }}
                    className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Producer</span>
                  </button>
                )}

                {fullViewSeller.status !== "Rejected" && (
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateStatus(fullViewSeller.id, "Rejected");
                      setFullViewSeller((p) => ({ ...p, status: "Rejected" }));
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-200 transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setFullViewSeller(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

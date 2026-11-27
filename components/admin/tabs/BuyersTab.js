"use client";

import React, { useState } from "react";
import { Search, Filter, Users, Plus, Eye, X, Phone, MapPin, CreditCard, Building2, AlertCircle, Sparkles } from "lucide-react";

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

export default function BuyersTab({ buyers = [], setBuyers, onLogAction, onNotify }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedBuyer, setSelectedBuyer] = useState(buyers[0] || null);
  const [fullViewBuyer, setFullViewBuyer] = useState(null);

  // Add Buyer Modal State (Zero Static Pre-fills)
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [newBuyerData, setNewBuyerData] = useState({
    name: "",
    buyerType: "Business / Mandi Trader",
    contactName: "",
    phone: "",
    district: "Coimbatore",
    operatingDistrict: "",
    interestCommodities: "",
  });

  const handleOpenAddModal = () => {
    setFormError("");
    setNewBuyerData({
      name: "",
      buyerType: "Business / Mandi Trader",
      contactName: "",
      phone: "",
      district: "Coimbatore",
      operatingDistrict: "",
      interestCommodities: "",
    });
    setAddModalOpen(true);
  };

  const filteredBuyers = buyers.filter((buyer) => {
    const matchesSearch =
      buyer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.operatingDistrict?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ||
      buyer.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = (id) => {
    let updatedName = "";
    let nextStatus = "";
    if (setBuyers) {
      setBuyers((prev) =>
        prev.map((b) => {
          if (b.id !== id) return b;
          nextStatus = b.status === "Active" ? "Suspended" : "Active";
          updatedName = b.name;
          return { ...b, status: nextStatus };
        })
      );
    }
    if (selectedBuyer?.id === id) {
      setSelectedBuyer((prev) => ({
        ...prev,
        status: prev.status === "Active" ? "Suspended" : "Active",
      }));
    }
    if (onLogAction) onLogAction("Buyer Status Changed", `Changed "${updatedName || id}" status to ${nextStatus}.`);
    if (onNotify) onNotify(`Buyer "${updatedName || id}" status changed to ${nextStatus}`);
  };

  const handleAddNewBuyer = () => {
    setFormError("");
    const name = newBuyerData.name.trim();
    const contactName = newBuyerData.contactName.trim();
    const phone = newBuyerData.phone.trim();
    const district = newBuyerData.district || "Coimbatore";
    const operatingDistrict =
      newBuyerData.operatingDistrict.trim() || `${district}, Tamil Nadu`;
    const interestCommodities =
      newBuyerData.interestCommodities.trim() ||
      "Paddy, Organic Vegetables, Millets, Oilseeds";

    if (!name) {
      setFormError("Please enter the company / mandi trader name.");
      return;
    }
    if (!phone) {
      setFormError("Please enter the contact mobile phone number.");
      return;
    }

    const newRecord = {
      id: `BUY-${String(buyers.length + 1).padStart(3, "0")}`,
      name,
      buyerType: newBuyerData.buyerType,
      contactName: contactName || "Commercial Procurement Desk",
      phone,
      district,
      operatingDistrict,
      sellersViewable: "0 / 10",
      subscriptionStatus: "Verified Annual Access (₹365/Yr)",
      status: "Active",
      registeredDate: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      interestCommodities,
    };

    if (setBuyers) {
      setBuyers((prev) => [newRecord, ...prev]);
    }
    setSelectedBuyer(newRecord);
    setAddModalOpen(false);
    setNewBuyerData({
      name: "",
      buyerType: "Business / Mandi Trader",
      contactName: "",
      phone: "",
      district: "Coimbatore",
      operatingDistrict: "",
      interestCommodities: "",
    });
    if (onLogAction)
      onLogAction(
        "Buyer Enrolled",
        `Enrolled commercial mandi buyer "${newRecord.name}".`
      );
    if (onNotify)
      onNotify(`Commercial buyer "${newRecord.name}" registered successfully.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search buyers by name, contact, or district..."
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
            <span>Add Buyer</span>
          </button>

          <Filter className="w-4 h-4 text-gray-500 ml-1" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174B35]/20 cursor-pointer text-[#174B35]"
          >
            <option value="All">All Buyers ({buyers.length})</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Main Content: Empty State when no buyers */}
      {buyers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#E8F0E3] text-[#174B35] mx-auto flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-extrabold text-gray-900">No Buyers Registered Yet</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Wholesale mandi buyers and commercial food processors will appear here once registered. You can add a buyer record below.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Register First Buyer</span>
          </button>
        </div>
      ) : (
        <div className="w-full">
          <div className="w-full bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-gray-200/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Buyer List ({filteredBuyers.length})
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Click any buyer row to open the complete trading profile card &amp; sourcing limits</p>
              </div>
              <span className="text-xs font-bold text-[#174B35] bg-[#E8F0E3] px-2.5 py-1 rounded-lg border border-[#729B59]/30">
                {buyers.length} {buyers.length === 1 ? "Buyer" : "Buyers"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs ">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200/80 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-3.5 pl-4">Buyer</th>
                    <th className="p-3.5">Contact</th>
                    <th className="p-3.5">Sellers Viewable</th>
                    <th className="p-3.5">Subscription / Access</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBuyers.map((buyer) => {
                    const isSelected = selectedBuyer?.id === buyer.id;
                    return (
                      <tr
                        key={buyer.id}
                        onClick={() => setFullViewBuyer(buyer)}
                        className="hover:bg-[#E8F0E3]/40 transition-all cursor-pointer group"
                      >
                        <td className="p-3.5 pl-5">
                          <div className="font-extrabold text-gray-900 group-hover:text-[#174B35] transition-colors">{buyer.name}</div>
                          <div className="text-[11px] text-gray-400 font-mono mt-0.5">{buyer.id || buyer.buyerType}</div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-gray-900">{buyer.contactName}</div>
                          <div className="text-gray-500 text-[11px]">{buyer.phone}</div>
                          <div className="text-[10px] text-emerald-800 font-semibold">{buyer.district}</div>
                        </td>

                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#E8F0E3] text-[#174B35] border border-[#729B59]/30">
                            {buyer.sellersViewable}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <div className="text-gray-900 font-semibold">{buyer.subscriptionStatus}</div>
                          <div className="text-[11px] text-gray-400">Reg: {buyer.registeredDate || buyer.registrationDate || "Active"}</div>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              buyer.status === "Active"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-red-100 text-red-800 border border-red-300"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{buyer.status}</span>
                          </span>
                        </td>

                        {/* Minimalist Clean Icon Actions */}
                        <td className="p-3.5 text-right pr-5">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {/* Eye: Full View Modal */}
                            <button
                              type="button"
                              title="Inspect Full Buyer Profile"
                              onClick={() => {
                                setSelectedBuyer(buyer);
                                setFullViewBuyer(buyer);
                              }}
                              className="p-1.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-[#174B35] hover:bg-[#E8F0E3]/60 hover:border-[#729B59]/40 transition-all shadow-2xs cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Suspend / Activate Icon */}
                            <button
                              type="button"
                              title={buyer.status === "Active" ? "Suspend Buyer Access" : "Activate Buyer Access"}
                              onClick={() => handleToggleStatus(buyer.id)}
                              className={`p-1.5 rounded-xl border transition-all shadow-2xs cursor-pointer ${
                                buyer.status === "Active"
                                  ? "bg-white text-gray-400 border-gray-200 hover:text-amber-700 hover:bg-amber-50"
                                  : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-600 hover:text-white"
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
              <span>Click on any buyer row to open the complete profile card &amp; sourcing limits.</span>
              <span className="font-bold text-[#174B35]">
                {filteredBuyers.length} Buyers Registered
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* Add New Mandi Buyer Modal                                */}
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
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-2">
                    <span>Register Mandi Buyer</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/70 text-[#174B35]">
                      Wholesale Trader
                    </span>
                  </h4>
                  <p className="text-xs text-gray-500 font-medium">
                    Enroll licensed agro-traders, supermarket chains, and food millers
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

              {/* Company / Mandi Trader Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Company / Mandi Trader Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kongu Super Mandi Traders & Wholesale Mart"
                  value={newBuyerData.name}
                  onChange={(e) => {
                    setNewBuyerData({ ...newBuyerData, name: e.target.value });
                    if (formError) setFormError("");
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all rounded-xl shadow-2xs"
                />
              </div>

              {/* Buyer Classification & Base District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Buyer Classification
                  </label>
                  <select
                    value={newBuyerData.buyerType}
                    onChange={(e) =>
                      setNewBuyerData({
                        ...newBuyerData,
                        buyerType: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all rounded-xl shadow-2xs"
                  >
                    <option value="Business / Mandi Trader">
                      Business / Mandi Trader
                    </option>
                    <option value="Retail Mandi Chain">Retail Mandi Chain</option>
                    <option value="Modern Supermarket / Hypermarket">
                      Modern Supermarket / Hypermarket
                    </option>
                    <option value="Food Processing Unit / Miller">
                      Food Processing Unit / Miller
                    </option>
                    <option value="Direct Institutional Consumer">
                      Direct Institutional Consumer
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Primary Operating District
                  </label>
                  <select
                    value={newBuyerData.district}
                    onChange={(e) =>
                      setNewBuyerData({
                        ...newBuyerData,
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

              {/* Contact Representative & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Procurement Officer / Contact Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. R. Karthik (Procurement Lead)"
                    value={newBuyerData.contactName}
                    onChange={(e) =>
                      setNewBuyerData({
                        ...newBuyerData,
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
                    placeholder="e.g. +91 98400 12345"
                    value={newBuyerData.phone}
                    onChange={(e) => {
                      setNewBuyerData({
                        ...newBuyerData,
                        phone: e.target.value,
                      });
                      if (formError) setFormError("");
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all rounded-xl shadow-2xs"
                  />
                </div>
              </div>

              {/* Operating Region Coverage */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Operating Districts Coverage
                </label>
                <input
                  type="text"
                  placeholder="e.g. Coimbatore, Tiruppur, Erode, Nilgiris"
                  value={newBuyerData.operatingDistrict}
                  onChange={(e) =>
                    setNewBuyerData({
                      ...newBuyerData,
                      operatingDistrict: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:outline-none focus:border-[#174B35] focus:ring-4 focus:ring-emerald-600/10 transition-all rounded-xl shadow-2xs"
                />
              </div>

              {/* Interested Commodities */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Interested Agricultural Commodities
                </label>
                <input
                  type="text"
                  placeholder="e.g. Traditional Rice, Small Shallots, Bananas, Cold Pressed Oils"
                  value={newBuyerData.interestCommodities}
                  onChange={(e) =>
                    setNewBuyerData({
                      ...newBuyerData,
                      interestCommodities: e.target.value,
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
                <span>Default 10 cultivators access quota granted</span>
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
                  onClick={handleAddNewBuyer}
                  className="px-5 py-2 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Register Buyer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🚀 BUYER FULL VIEW CARD MODAL                            */}
      {/* ======================================================== */}
      {fullViewBuyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-2xl w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F0E3] text-[#174B35] border border-[#729B59]/40">
                    {fullViewBuyer.buyerType}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      fullViewBuyer.status === "Active"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-red-100 text-red-800 border border-red-200"
                    }`}
                  >
                    &bull; {fullViewBuyer.status}
                  </span>
                  <span className="text-[11px] font-mono text-gray-400">
                    {fullViewBuyer.id}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  {fullViewBuyer.name}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setFullViewBuyer(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Buyer Commercial Profile Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#174B35] to-[#0E2F21] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
              <div className="space-y-1">
                <div className="text-[11px] uppercase tracking-wider text-emerald-200 font-bold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Wholesale Procurement Buyer</span>
                </div>
                <h4 className="text-base sm:text-lg font-black">{fullViewBuyer.contactName}</h4>
                <div className="text-xs text-emerald-100/90 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-300" />
                  <span>{fullViewBuyer.phone}</span>
                  <span>&bull;</span>
                  <MapPin className="w-3 h-3 text-emerald-300" />
                  <span>{fullViewBuyer.district || fullViewBuyer.operatingDistrict}</span>
                </div>
              </div>

              <div className="sm:text-right shrink-0 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15">
                <div className="text-[10px] uppercase font-bold text-emerald-200 flex items-center gap-1 justify-end">
                  <CreditCard className="w-3 h-3" />
                  <span>Farmer Reveal Quota</span>
                </div>
                <div className="text-lg font-black text-white">{fullViewBuyer.sellersViewable}</div>
                <div className="text-[10px] text-emerald-200">Verified Mandi Access</div>
              </div>
            </div>

            {/* Procurement Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Operating Regions</span>
                <span className="font-bold text-gray-800 block">
                  {fullViewBuyer.operatingDistrict || fullViewBuyer.district || "Tamil Nadu"}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Target Commodities</span>
                <span className="font-bold text-[#174B35] block">
                  {fullViewBuyer.interestCommodities || "General Agricultural Produce"}
                </span>
              </div>
            </div>

            {/* Administrative Action Bar inside the Full Card */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  handleToggleStatus(fullViewBuyer.id);
                  setFullViewBuyer((p) => ({
                    ...p,
                    status: p.status === "Active" ? "Suspended" : "Active",
                  }));
                }}
                className={`px-4 py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                  fullViewBuyer.status === "Active"
                    ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200"
                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                }`}
              >
                {fullViewBuyer.status === "Active" ? "Suspend Account" : "Activate Account"}
              </button>

              <button
                type="button"
                onClick={() => setFullViewBuyer(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

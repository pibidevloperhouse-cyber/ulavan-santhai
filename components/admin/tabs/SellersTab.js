"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, CheckCircle2, AlertCircle, Eye, FileText, Check, Store, MapPin, X, Shield, Phone, CreditCard, ExternalLink, Download, Loader2 } from "lucide-react";
import { updateAdminSeller, getSellerDocuments } from "@/services/adminApi";

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
  const [sellerUserDocs, setSellerUserDocs] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [docLoadError, setDocLoadError] = useState(false);

  // Fetch user-wise uploaded documents strictly for the opened seller (user_documents bucket)
  useEffect(() => {
    const userId = fullViewSeller?.userId;
    if (!userId) {
      setSellerUserDocs([]);
      return;
    }

    let cancelled = false;
    setIsLoadingDocs(true);
    setSellerUserDocs([]);

    getSellerDocuments(userId)
      .then((res) => {
        if (cancelled) return;
        if (res?.success && Array.isArray(res.data)) {
          setSellerUserDocs(res.data);
        }
      })
      .catch(() => {
        if (!cancelled) setSellerUserDocs([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDocs(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fullViewSeller?.userId]);

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
    let currentName = selectedSeller?.businessName || id;
    if (setSellers) {
      setSellers((prev) =>
        prev.map((s) => {
          if (s.id !== id) return s;
          currentName = s.businessName || id;
          return { ...s, status: newStatus };
        })
      );
    }
    if (selectedSeller?.id === id) {
      setSelectedSeller((prev) => ({ ...prev, status: newStatus }));
    }
    if (id) {
      updateAdminSeller(id, { status: newStatus }).catch((err) => {
        console.warn("Backend seller status update notification:", err);
      });
    }
    if (onLogAction) onLogAction(`Seller ${newStatus}`, `Marked "${currentName}" as ${newStatus}.`);
    if (onNotify) onNotify(`Seller "${currentName}" marked as ${newStatus}`);
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
          <Filter className="w-4 h-4 text-gray-500" />
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
              Cultivator and direct farm producer registrations will appear here for verification.
            </p>
          </div>
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

      {/* Verification Document Modal */}
      {previewDoc && (() => {
        const viewSrc = previewDoc.previewUrl || previewDoc.url || "";
        const fallbackSrc = previewDoc.url || previewDoc.previewUrl || "";
        const docHint = `${previewDoc.mimeType || ""} ${previewDoc.fileName || ""} ${previewDoc.storagePath || ""} ${previewDoc.url || ""}`.toLowerCase();
        const isPdf = previewDoc.mimeType === "application/pdf" || docHint.includes(".pdf");
        const isImage =
          previewDoc.mimeType?.startsWith("image/") ||
          /\.(png|jpe?g|webp|gif|bmp)(\?|$)/i.test(docHint);

        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h4 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#174B35]" />
                  <span>Document Preview &bull; {previewDoc.name}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewDoc(null);
                    setDocLoadError(false);
                  }}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 text-lg font-bold cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Document Type</span>
                  <span className="font-bold text-gray-900">{previewDoc.name}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Document ID / File</span>
                  <span className="font-semibold text-gray-900 break-all">{previewDoc.fileName || previewDoc.number}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Status / Authority</span>
                  <span className="font-semibold text-[#174B35]">{previewDoc.validity || previewDoc.status} &bull; {previewDoc.authority}</span>
                </div>
              </div>

              {viewSrc ? (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 space-y-3">
                  {docLoadError ? (
                    <div className="p-6 text-center space-y-2">
                      <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                      <p className="text-xs font-bold text-gray-800">Inline preview could not be rendered</p>
                      <p className="text-[11px] text-gray-500">Use the Open in New Tab button below to view directly from storage.</p>
                    </div>
                  ) : isPdf ? (
                    <iframe
                      src={viewSrc}
                      title={previewDoc.fileName || previewDoc.name}
                      className="w-full h-[60vh] rounded-xl border border-gray-200 bg-white"
                      onError={() => setDocLoadError(true)}
                    />
                  ) : isImage ? (
                    <div className="flex items-center justify-center bg-white rounded-xl border border-gray-200 p-2 min-h-[220px]">
                      <img
                        src={viewSrc}
                        alt={previewDoc.fileName || previewDoc.name}
                        className="max-h-[60vh] w-auto object-contain rounded-lg"
                        onError={(e) => {
                          if (fallbackSrc && e.currentTarget.src !== fallbackSrc) {
                            e.currentTarget.src = fallbackSrc;
                          } else {
                            setDocLoadError(true);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <iframe
                      src={viewSrc}
                      title={previewDoc.fileName || previewDoc.name}
                      className="w-full h-[60vh] rounded-xl border border-gray-200 bg-white"
                      onError={() => setDocLoadError(true)}
                    />
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#E8F0E3]/60 border border-[#729B59]/30 text-center">
                  <CheckCircle2 className="w-8 h-8 text-[#174B35] mx-auto mb-1" />
                  <p className="text-xs font-bold text-[#174B35]">Metadata Verification Record</p>
                  <p className="text-[11px] text-gray-500">No uploaded file attached to this compliance entry.</p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  {viewSrc && (
                    <>
                      <a
                        href={fallbackSrc || viewSrc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 text-xs font-bold inline-flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open in New Tab</span>
                      </a>
                      <a
                        href={viewSrc}
                        download={previewDoc.fileName || previewDoc.number || "document"}
                        className="px-3.5 py-2 rounded-xl bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 text-xs font-bold inline-flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewDoc(null);
                      setDocLoadError(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewDoc(null);
                      setDocLoadError(false);
                      if (onNotify) onNotify(`Certificate "${previewDoc.name}" confirmed verified`);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#174B35] text-white text-xs font-bold hover:bg-[#103A29] cursor-pointer"
                  >
                    Confirm Verification
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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

            {/* Verification Documents & Land Records (Strictly User-Wise) */}
            <div className="p-4 rounded-2xl bg-[#E8F0E3]/70 border border-[#729B59]/40 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-black text-[#174B35] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#174B35]" />
                  <span>Submitted Land &amp; Identity Certificates</span>
                </span>
                {isLoadingDocs && (
                  <span className="text-[11px] font-semibold text-[#174B35] flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Loading user docs...</span>
                  </span>
                )}
              </div>
              <div className="divide-y divide-[#729B59]/20 pt-1">
                {(() => {
                  // Merge user-wise fetched documents from user_documents bucket with any static compliance metadata
                  const fetchedIds = new Set(sellerUserDocs.map((d) => d.documentId || d.id));
                  const metadataOnly = (fullViewSeller.certifications || []).filter(
                    (c) => !c.url && !c.previewUrl && !fetchedIds.has(c.number) && c.name !== "Cultivator Onboarding Record" && c.name !== "Verified Seller Membership"
                  );
                  const displayDocs =
                    sellerUserDocs.length > 0
                      ? [...sellerUserDocs, ...metadataOnly]
                      : fullViewSeller.certifications || [];

                  if (displayDocs.length === 0) {
                    return (
                      <p className="py-2 text-gray-500 italic">
                        No documents uploaded by this seller yet.
                      </p>
                    );
                  }

                  return displayDocs.map((doc, idx) => (
                    <div key={doc.id || doc.number || idx} className="py-2 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-gray-900">{doc.name || doc.documentType}</div>
                        <div className="text-[11px] text-gray-600 truncate">
                          {doc.fileName ? `${doc.fileName} • ` : ""}{doc.number || doc.id} &bull; {doc.authority}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDocLoadError(false);
                          setPreviewDoc(doc);
                        }}
                        className="shrink-0 px-2.5 py-1 rounded-lg bg-white border border-[#729B59]/50 text-[#174B35] font-bold text-[11px] hover:bg-[#174B35] hover:text-white transition-colors cursor-pointer"
                      >
                        {doc.previewUrl || doc.url ? "View Document" : "Inspect Doc"}
                      </button>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Administrative Action Bar inside the Full Card */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2 text-xs">
              {fullViewSeller.status !== "Approved" && (
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateStatus(fullViewSeller.id, "Approved");
                    setFullViewSeller((p) => ({ ...p, status: "Approved" }));
                  }}
                  className="px-5 py-2 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
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
                  className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-200 transition-colors cursor-pointer"
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
      )}
    </div>
  );
}

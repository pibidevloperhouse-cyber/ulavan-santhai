"use client";

import React from "react";
import {
  Users,
  Store,
  PackageCheck,
  Layers,
  CreditCard,
  ReceiptIndianRupee,
  MessageSquare,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

export default function DashboardTab({ stats, onNavigateTab, onNotify }) {
  const statCards = [
    { label: "Total Buyers", value: stats.totalBuyers.toLocaleString(), sub: "+14 this week", icon: Users, color: "text-[#174B35] bg-[#E8F0E3] border-[#729B59]/40", tab: "buyers" },
    { label: "Active Buyers", value: stats.activeBuyers.toLocaleString(), sub: "Verified access", icon: Users, color: "text-[#174B35] bg-[#E8F0E3] border-[#729B59]/40", tab: "buyers" },
    { label: "Total Sellers", value: stats.totalSellers.toLocaleString(), sub: "Tamil Nadu cultivators", icon: Store, color: "text-[#174B35] bg-[#E8F0E3] border-[#729B59]/40", tab: "sellers" },
    { label: "Active Sellers", value: stats.activeSellers.toLocaleString(), sub: "Direct Farm Producers", icon: Store, color: "text-[#174B35] bg-[#E8F0E3] border-[#729B59]/40", tab: "sellers" },
    { label: "Products Listed", value: stats.products.toLocaleString(), sub: "Agri & Value-added", icon: PackageCheck, color: "text-amber-800 bg-amber-50 border-amber-200", tab: "products" },
    { label: "Active Categories", value: stats.categories.toLocaleString(), sub: "5 Core Agri Segments", icon: Layers, color: "text-[#174B35] bg-[#E8F0E3] border-[#729B59]/40", tab: "categories" },
    { label: "Active Subscriptions", value: stats.activeSubscriptions.toLocaleString(), sub: "₹365/Yr Memberships", icon: CreditCard, color: "text-emerald-800 bg-emerald-50 border-emerald-200", tab: "subscriptions" },
    { label: "Expired Subscriptions", value: stats.expiredSubscriptions.toLocaleString(), sub: "Grace period pending", icon: Clock, color: "text-red-700 bg-red-50 border-red-200", tab: "subscriptions" },
    { label: "Total Payments", value: stats.payments, sub: "Membership access fees", icon: ReceiptIndianRupee, color: "text-[#174B35] bg-[#E8F0E3] border-[#729B59]/40", tab: "payments" },
    { label: "Enquiries & Connections", value: stats.enquiriesInteractions.toLocaleString(), sub: "Direct Farmer 0% Middleman", icon: MessageSquare, color: "text-emerald-800 bg-emerald-50 border-emerald-200", tab: "reports" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Alert banner for verification queue */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#729B59]/30 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#E8F0E3] text-[#174B35] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-gray-900">
              Direct Farmer &amp; Trader Verification Queue
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Review submitted Patta/Chitta land documents, FSSAI certificates, and new agricultural product listings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (onNavigateTab) onNavigateTab("sellers");
              if (onNotify) onNotify("Navigated to Sellers review");
            }}
            className="px-4 py-2 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Review Sellers</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (onNavigateTab) onNavigateTab("products");
              if (onNotify) onNotify("Navigated to Products review");
            }}
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#E8F0E3]/40 text-[#174B35] border border-gray-300 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Review Products</span>
          </button>
        </div>
      </div>

      {/* Grid of Metric Cards (Clickable) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#174B35]">
            Platform Overview Metrics
          </h3>
          <span className="text-[11px] text-gray-400 font-medium">Click any card to inspect category</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                onClick={() => {
                  if (onNavigateTab) onNavigateTab(card.tab);
                  if (onNotify) onNotify(`Viewing ${card.label} section`);
                }}
                className="group p-4 rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:border-[#174B35] hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-gray-600 group-hover:text-[#174B35] transition-colors truncate">
                    {card.label}
                  </span>
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${card.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div>
                  <div className="text-2xl font-black text-gray-900 tracking-tight">{card.value}</div>
                  <div className="text-[11px] text-gray-500 mt-1 font-medium flex items-center justify-between">
                    <span>{card.sub}</span>
                    <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-[#174B35] transition-colors" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs">
          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center justify-between">
            <span>Membership &amp; Access Model</span>
            <span className="text-xs font-semibold text-[#174B35] bg-[#E8F0E3] px-2 py-0.5 rounded-md">Live Rules</span>
          </h4>
          <div className="space-y-2.5 text-xs text-gray-600">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAF7] border border-gray-100">
              <span className="font-semibold text-gray-800">Seller Platform Membership:</span>
              <span className="font-bold text-[#174B35]">₹365 / Year (Annual)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAF7] border border-gray-100">
              <span className="font-semibold text-gray-800">Buyer Direct Sourcing Access:</span>
              <span className="font-bold text-[#174B35]">₹365 (Access up to 10 Sellers)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAF7] border border-gray-100">
              <span className="font-semibold text-gray-800">Additional Sourcing Add-on:</span>
              <span className="font-bold text-[#174B35]">₹10 per extra 10 Sellers</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs">
          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center justify-between">
            <span>Direct Trade Principles</span>
            <span className="text-xs font-bold text-[#174B35] bg-[#E8F0E3] px-2 py-0.5 rounded-md">0% Middleman</span>
          </h4>
          <p className="text-xs text-gray-600 leading-relaxed">
            Ulavan Santhai connects farmers, FPOs, and value-added agro-manufacturers directly with wholesale commercial buyers and individual consumers. Platform eliminates commission margins, retaining transparent direct contact and certificate verification.
          </p>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">Platform Governance Status</span>
            <span className="text-[#174B35] font-bold">100% Direct Settlement</span>
          </div>
        </div>
      </div>
    </div>
  );
}

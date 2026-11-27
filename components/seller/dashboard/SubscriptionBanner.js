"use client";

import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function SubscriptionBanner({
  daysRemaining = 365,
  sellerName = "Seller",
  totalProducts = 0,
}) {
  const pct = Math.min(100, Math.max(4, Math.round((daysRemaining / 365) * 100)));
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B3C26] via-[#135235] to-[#1D6B44] text-white p-6 sm:p-7 shadow-sm border border-[#1E5C3E]">
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5 min-w-0 max-w-2xl">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-snug">
            Welcome back, {sellerName}
          </h2>

          <p className="text-xs sm:text-sm text-[#D1E8D7] leading-relaxed">
            {totalProducts === 0
              ? "Your seller account is active. Add your first agricultural product to start receiving buyer enquiries."
              : `You have ${totalProducts} product listing${totalProducts === 1 ? "" : "s"} in your storefront.`}
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3.5 shrink-0">
          <Link
            href="/seller/subscription"
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-colors"
          >
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 56 56">
                <circle
                  cx="28"
                  cy="28"
                  r={radius}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.18)"
                  strokeWidth="4.5"
                />
                <circle
                  cx="28"
                  cy="28"
                  r={radius}
                  fill="none"
                  stroke="#C5F340"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <span className="absolute font-space text-[11px] font-bold text-white">
                {daysRemaining}d
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-white">Manage Plan</div>
              <div className="text-[11px] text-[#C8E2CE]">₹365 / year</div>
            </div>
          </Link>

          <Link
            href="/seller/products/add"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-[#C5F340] hover:bg-[#d3fc59] text-[#0B3C26] text-xs sm:text-sm font-extrabold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

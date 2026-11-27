"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Plus } from "lucide-react";

export default function SubscriptionBanner({
  daysRemaining = 365,
  sellerName = "Seller",
  sellerType = "Farmer",
  totalProducts = 0,
}) {
  const pct = Math.min(100, Math.max(4, Math.round((daysRemaining / 365) * 100)));
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B3C26] via-[#114B30] to-[#175B3B] text-white p-6 sm:p-7 shadow-sm ring-1 ring-[#0B3C26]/20">
      {/* Subtle warm lime ambient glow */}
      <div className="pointer-events-none absolute -top-20 -right-12 w-64 h-64 rounded-full bg-[#C5F340]/12 blur-3xl" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Calm Executive Greeting */}
        <div className="space-y-3 min-w-0 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C5F340] text-[#0B3C26] text-[10px] font-extrabold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0B3C26]" />
              Verified {sellerType}
            </span>
            <span className="text-[11px] font-semibold text-[#C3DAC9]">
              · Storefront Live
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-snug">
            Welcome back, {sellerName}
          </h2>

          <p className="text-xs sm:text-sm text-[#CBE0D1] leading-relaxed">
            {totalProducts === 0
              ? "Your seller account is verified and ready. Add your first agricultural product to start receiving buyer enquiries."
              : `You have ${totalProducts} product listing${totalProducts === 1 ? "" : "s"} active in your storefront.`}
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-0.5 text-xs font-medium text-[#E5F2E8]">
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#C5F340] stroke-[2.5]" />
              0% Middleman Margin
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#C5F340] stroke-[2.5]" />
              Annual Pass Active ({daysRemaining} days left)
            </span>
          </div>
        </div>

        {/* Right: Plan Ring + Primary Lime CTA */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3.5 shrink-0">
          <Link
            href="/seller/subscription"
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all group"
          >
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 56 56">
                <circle
                  cx="28"
                  cy="28"
                  r={radius}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.16)"
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
              <div className="text-[11px] text-[#C3DAC9]">₹365 / year</div>
            </div>
            <span className="w-7 h-7 rounded-full bg-white/15 text-[#C5F340] flex items-center justify-center ml-1 group-hover:bg-[#C5F340] group-hover:text-[#0B3C26] transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/seller/products/add"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-[#C5F340] hover:bg-[#d4ff62] text-[#0B3C26] text-xs sm:text-sm font-extrabold shadow-sm transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import StatusBadge from "../ui/StatusBadge";

export default function DashboardMetricCards({ metrics }) {
  if (!metrics) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Account status */}
      <Link
        href="/seller/profile"
        className="bg-white border border-[#E5E0D5] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-[#1B4D36] hover:shadow-sm active:scale-98 transition-all cursor-pointer group"
      >
        <div className="text-xs text-[#4B5563] font-semibold group-hover:text-[#1B4D36] transition-colors">
          Account status
        </div>
        <div className="my-2.5">
          <StatusBadge status={metrics.accountStatus?.status} />
        </div>
        <div className="text-xs text-[#6B7280] leading-tight">
          {metrics.accountStatus?.subtext}
        </div>
      </Link>

      {/* Subscription */}
      <Link
        href="/seller/subscription"
        className="bg-white border border-[#E5E0D5] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-[#1B4D36] hover:shadow-sm active:scale-98 transition-all cursor-pointer group"
      >
        <div className="text-xs text-[#4B5563] font-semibold group-hover:text-[#1B4D36] transition-colors">
          Subscription
        </div>
        <div className="my-2.5">
          <StatusBadge status={metrics.subscription?.status} />
        </div>
        <div className="text-xs text-[#6B7280] leading-tight">
          {metrics.subscription?.subtext}
        </div>
      </Link>

      {/* Total products */}
      <Link
        href="/seller/products"
        className="bg-white border border-[#E5E0D5] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-[#1B4D36] hover:shadow-sm active:scale-98 transition-all cursor-pointer group"
      >
        <div className="text-xs text-[#4B5563] font-semibold group-hover:text-[#1B4D36] transition-colors">
          Total products
        </div>
        <div className="my-1">
          <span className="text-3xl font-extrabold tracking-tight text-[#111827] group-hover:text-[#1B4D36] transition-colors">
            {metrics.totalProducts?.count || 0}
          </span>
        </div>
        <div className="text-xs text-[#6B7280] leading-tight">
          {metrics.totalProducts?.subtext}
        </div>
      </Link>

      {/* New Buyer enquiries */}
      <Link
        href="/seller/enquiries"
        className="bg-white border border-[#E5E0D5] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-[#1B4D36] hover:shadow-sm active:scale-98 transition-all cursor-pointer group"
      >
        <div className="text-xs text-[#4B5563] font-semibold group-hover:text-[#1B4D36] transition-colors">
          New Buyer enquiries
        </div>
        <div className="my-1">
          <span className="text-3xl font-extrabold tracking-tight text-[#111827] group-hover:text-[#1B4D36] transition-colors">
            {metrics.buyerEnquiries?.count || 0}
          </span>
        </div>
        <div className="text-xs text-[#6B7280] leading-tight">
          {metrics.buyerEnquiries?.subtext}
        </div>
      </Link>
    </div>
  );
}

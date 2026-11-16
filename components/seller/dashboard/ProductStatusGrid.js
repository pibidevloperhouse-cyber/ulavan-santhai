"use client";

import React from "react";
import Link from "next/link";
import StatusBadge from "../ui/StatusBadge";

export default function ProductStatusGrid({ statusBreakdown = [] }) {
  return (
    <div className="bg-white border border-[#E5E0D5] rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#1F2937]">
          Product listings by status
        </h2>
        <Link
          href="/seller/products"
          className="text-xs text-[#1B4D36] font-semibold hover:underline"
        >
          Manage products
        </Link>
      </div>

      {/* Row 1 (Top 6 statuses) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statusBreakdown.slice(0, 6).map((item) => (
          <Link
            key={item.label}
            href={`/seller/products?status=${encodeURIComponent(item.label)}`}
            className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg p-3 flex flex-col justify-between hover:border-[#1B4D36] hover:bg-[#F9FAF8] hover:shadow-xs active:scale-98 transition-all cursor-pointer group"
          >
            <div>
              <StatusBadge status={item.label} />
            </div>
            <div className="mt-2.5 text-2xl font-bold text-[#111827] group-hover:text-[#1B4D36] transition-colors">
              {item.count}
            </div>
          </Link>
        ))}
      </div>

      {/* Row 2 (Remaining statuses) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {statusBreakdown.slice(6).map((item) => (
          <Link
            key={item.label}
            href={`/seller/products?status=${encodeURIComponent(item.label)}`}
            className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg p-3 flex flex-col justify-between hover:border-[#1B4D36] hover:bg-[#F9FAF8] hover:shadow-xs active:scale-98 transition-all cursor-pointer group"
          >
            <div>
              <StatusBadge status={item.label} />
            </div>
            <div className="mt-2 text-xl font-bold text-[#111827] group-hover:text-[#1B4D36] transition-colors">
              {item.count}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const STATUS_DOT = {
  Draft: "bg-[#6B7280]",
  Submitted: "bg-[#D97706]",
  "Under Review": "bg-[#D97706]",
  Approved: "bg-[#1D7446]",
  Published: "bg-[#174B35]",
  Inactive: "bg-[#6B7280]",
  Rejected: "bg-[#DC2626]",
  "Expired / Unavailable": "bg-[#DC2626]",
};

export default function ProductStatusGrid({ statusBreakdown = [] }) {
  const orderedLabels = [
    "Draft",
    "Submitted",
    "Under Review",
    "Approved",
    "Published",
    "Inactive",
    "Rejected",
    "Expired / Unavailable",
  ];

  const byLabel = new Map(statusBreakdown.map((item) => [item.label, item]));
  const items = orderedLabels.map(
    (label) => byLabel.get(label) || { label, count: 0, statusKey: label }
  );

  const totalCount = items.reduce(
    (sum, item) => sum + (Number(item.count) || 0),
    0
  );

  return (
    <div className="bg-white border border-[#E5E0D5] rounded-xl p-4 sm:p-5 shadow-2xs space-y-4 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F0ECE4]">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-sm font-bold text-[#111827]">
            Product listings by status
          </h2>
          <span className="font-space text-[11px] font-semibold text-[#5B6860] bg-[#F5F4F0] px-2 py-0.5 rounded-md">
            {totalCount}
          </span>
        </div>

        <Link
          href="/seller/products"
          className="inline-flex items-center gap-0.5 text-xs text-[#174B35] font-semibold hover:underline"
        >
          <span>Manage products</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Balanced Status Matrix: 2-col mobile, 4-col tablet, 2-col inside 1024px split, 4-col on xl desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3">
        {items.map((item) => {
          const dotColor = STATUS_DOT[item.label] || "bg-[#6B7280]";
          return (
            <Link
              key={item.label}
              href={`/seller/products?status=${encodeURIComponent(item.label)}`}
              className="min-w-0 bg-[#FAF9F6] hover:bg-[#F3F5F0] border border-[#EAE6DD] hover:border-[#9EB5A0] rounded-lg p-3 flex flex-col justify-between transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                <span
                  title={item.label}
                  className="text-xs font-medium text-[#374151] group-hover:text-[#111827] truncate"
                >
                  {item.label}
                </span>
              </div>

              <div className="mt-2.5 font-space text-xl sm:text-2xl font-bold text-[#111827] group-hover:text-[#174B35] transition-colors leading-none">
                {item.count}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

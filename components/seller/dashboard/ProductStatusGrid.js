"use client";

import React from "react";
import Link from "next/link";

export default function ProductStatusGrid({ statusBreakdown = [] }) {
  const byLabel = new Map(
    statusBreakdown.map((item) => [item.label, Number(item.count) || 0])
  );

  const stages = [
    {
      label: "Draft",
      count: byLabel.get("Draft") || 0,
      href: "/seller/products?status=Draft",
      cardClass: "bg-[#F5F7EC] hover:bg-[#ECF6D2] border-[#DDE7CE]",
      dotClass: "bg-[#6B7280]",
    },
    {
      label: "In Review",
      count: (byLabel.get("Submitted") || 0) + (byLabel.get("Under Review") || 0),
      href: "/seller/products?status=Under%20Review",
      cardClass: "bg-[#F5F7EC] hover:bg-[#ECF6D2] border-[#DDE7CE]",
      dotClass: "bg-[#D97706]",
    },
    {
      label: "Approved & Live",
      count: (byLabel.get("Approved") || 0) + (byLabel.get("Published") || 0),
      href: "/seller/products?status=Published",
      cardClass: "bg-[#ECF9C4] hover:bg-[#E1F5A5] border-[#C5E37A]",
      dotClass: "bg-[#2D8A3E]",
    },
    {
      label: "Inactive",
      count:
        (byLabel.get("Inactive") || 0) +
        (byLabel.get("Rejected") || 0) +
        (byLabel.get("Expired / Unavailable") || 0),
      href: "/seller/products?status=Inactive",
      cardClass: "bg-[#F5F7EC] hover:bg-[#ECF6D2] border-[#DDE7CE]",
      dotClass: "bg-[#DC2626]",
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#DDE7CE] shadow-xs space-y-4 min-w-0">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base sm:text-lg font-extrabold text-[#0B3C26]">
          Product Listings by Stage
        </h2>

        <Link
          href="/seller/products"
          className="text-xs font-bold text-[#174B35] hover:underline shrink-0"
        >
          Manage all
        </Link>
      </div>

      {/* Light-green stage cards with clean full labels */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stages.map((stage) => (
          <Link
            key={stage.label}
            href={stage.href}
            className={`p-4 rounded-2xl border transition-colors min-w-0 ${stage.cardClass}`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${stage.dotClass}`} />
              <span className="text-xs font-bold text-[#3C5840] leading-snug">
                {stage.label}
              </span>
            </div>
            <div className="mt-3 font-space text-2xl sm:text-3xl font-bold text-[#0B3C26] leading-none">
              {stage.count}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

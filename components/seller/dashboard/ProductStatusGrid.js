"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function ProductStatusGrid({ statusBreakdown = [] }) {
  const byLabel = new Map(
    statusBreakdown.map((item) => [item.label, Number(item.count) || 0])
  );

  const stages = [
    {
      num: "01",
      label: "Draft",
      count: byLabel.get("Draft") || 0,
      href: "/seller/products?status=Draft",
      cardClass: "bg-[#F5F5EB] hover:bg-[#ECECD9] border-[#0B3C26]/10",
      badgeClass: "bg-white text-[#0B3C26]",
    },
    {
      num: "02",
      label: "In Review",
      count: (byLabel.get("Submitted") || 0) + (byLabel.get("Under Review") || 0),
      href: "/seller/products?status=Under%20Review",
      cardClass: "bg-[#F5F5EB] hover:bg-[#ECECD9] border-[#0B3C26]/10",
      badgeClass: "bg-[#FEF3C7] text-[#92400E]",
    },
    {
      num: "03",
      label: "Approved & Live",
      count: (byLabel.get("Approved") || 0) + (byLabel.get("Published") || 0),
      href: "/seller/products?status=Published",
      cardClass: "bg-[#C5F340]/45 hover:bg-[#C5F340]/70 border-[#0B3C26]/15",
      badgeClass: "bg-[#0B3C26] text-white",
    },
    {
      num: "04",
      label: "Inactive / Issues",
      count:
        (byLabel.get("Inactive") || 0) +
        (byLabel.get("Rejected") || 0) +
        (byLabel.get("Expired / Unavailable") || 0),
      href: "/seller/products?status=Inactive",
      cardClass: "bg-[#F5F5EB] hover:bg-[#ECECD9] border-[#0B3C26]/10",
      badgeClass: "bg-white text-[#991B1B]",
    },
  ];

  const totalCount = stages.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 ring-1 ring-[#0B3C26]/10 shadow-xs space-y-5 min-w-0">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#54754B]">
            CATALOG PIPELINE
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-[#0B3C26] mt-0.5">
            Product Listings by Stage
          </h2>
        </div>

        <Link
          href="/seller/products"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#0B3C26] hover:opacity-80 shrink-0 group"
        >
          <span>Manage all</span>
          <span className="w-7 h-7 rounded-full bg-[#0B3C26] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>

      {/* Clean 4-stage horizontal grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stages.map((stage) => (
          <Link
            key={stage.label}
            href={stage.href}
            className={`p-4 rounded-2xl border transition-all group min-w-0 ${stage.cardClass}`}
          >
            <div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#4E6D45] truncate">
              {stage.num} / {stage.label}
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-space text-2xl sm:text-3xl font-bold text-[#0B3C26] leading-none">
                {stage.count}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stage.badgeClass}`}>
                {totalCount > 0 ? `${Math.round((stage.count / totalCount) * 100)}%` : "0%"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

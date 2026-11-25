"use client";

import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import HeaderAlertsPopover from "./HeaderAlertsPopover";

export default function SellerHeader({
  avatarText = "SN",
  showAddProduct = true,
}) {
  return (
    <div className="flex items-center flex-wrap sm:justify-end gap-2 sm:gap-2.5">
      <div className="hidden lg:block">
        <HeaderAlertsPopover />
      </div>

      <Link
        href="/get-started"
        className="inline-flex items-center justify-center px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white hover:bg-[#FAF9F5] text-[#24583B] text-[11px] sm:text-xs font-semibold rounded-lg border border-[#D5DCD4] transition-colors shadow-2xs"
      >
        Switch role
      </Link>

      {showAddProduct && (
        <Link
          href="/seller/products/add"
          className="inline-flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-[#24583B] hover:bg-[#1A432C] text-white text-[11px] sm:text-xs font-semibold rounded-lg transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          Add product
        </Link>
      )}

      <Link
        href="/seller/profile"
        title="View Profile and Settings"
        className="hidden lg:flex w-9 h-9 rounded-full bg-[#D7E6D9] text-[#1D4A30] font-bold text-xs items-center justify-center border border-[#BBD4BF] shadow-2xs hover:ring-2 hover:ring-[#24583B]/20 transition-all cursor-pointer shrink-0"
      >
        {avatarText}
      </Link>
    </div>
  );
}

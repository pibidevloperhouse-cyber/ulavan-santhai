"use client";

import React from "react";
import Link from "next/link";
import { Plus, Settings } from "lucide-react";
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
        className="inline-flex items-center justify-center px-3 py-2 bg-white hover:bg-[#F5F7EC] text-[#0B3C26] text-[11px] sm:text-xs font-semibold rounded-xl border border-[#DDE7CE] transition-colors shadow-2xs"
      >
        Switch role
      </Link>

      {showAddProduct && (
        <Link
          href="/seller/products/add"
          className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-[#C5F340] hover:bg-[#d3fc59] text-[#0B3C26] text-[11px] sm:text-xs font-extrabold rounded-xl transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          Add product
        </Link>
      )}

      <Link
        href="/seller/settings"
        title="Account Settings"
        aria-label="Account Settings"
        className="hidden lg:flex w-9 h-9 rounded-xl bg-white hover:bg-[#F5F7EC] text-[#3C5840] hover:text-[#0B3C26] items-center justify-center border border-[#DDE7CE] shadow-2xs transition-colors cursor-pointer shrink-0"
      >
        <Settings className="w-4 h-4" />
      </Link>

      <Link
        href="/seller/profile"
        title="View Seller Profile"
        className="hidden lg:flex w-9 h-9 rounded-full bg-[#ECF9C4] text-[#0B3C26] font-extrabold text-xs items-center justify-center border border-[#C5E37A] shadow-2xs hover:ring-2 hover:ring-[#8DC63F]/40 transition-all cursor-pointer shrink-0"
      >
        {avatarText}
      </Link>
    </div>
  );
}

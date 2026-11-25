"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function SubscriptionBanner({ daysRemaining = 365 }) {
  return (
    <div className="bg-white border border-[#E5E0D5] border-l-4 border-l-[#174B35] rounded-xl px-4 py-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 min-w-0">
      <div className="flex items-start sm:items-center gap-2.5 min-w-0">
        <span className="w-2 h-2 rounded-full bg-[#1D7446] mt-1.5 sm:mt-0 shrink-0" />
        <p className="text-xs sm:text-[13px] text-[#374151] leading-snug">
          <span className="font-semibold text-[#111827]">
            Subscription active ({daysRemaining} days left).
          </span>{" "}
          <span className="text-[#6B7280]">
            Products stay visible to buyers while your account and plan are in good standing.
          </span>
        </p>
      </div>

      <Link
        href="/seller/subscription"
        className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-[#F4F7F3] hover:bg-[#E8F0E3] text-[#174B35] border border-[#D4E0D5] text-xs font-semibold rounded-lg transition-colors shrink-0 self-start sm:self-auto"
      >
        <span>Manage plan</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

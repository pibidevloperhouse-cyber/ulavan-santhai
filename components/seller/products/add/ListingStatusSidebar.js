"use client";

import React from "react";

export default function ListingStatusSidebar() {
  return (
    <div className="space-y-4 lg:sticky lg:top-4">
      <div className="bg-white border border-[#EAE6DD] rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
          <h3 className="text-sm font-bold text-[#1F2922]">Listing status</h3>
          <span className="text-xs text-[#526458] font-medium">Lifecycle</span>
        </div>

        {/* Stepper Status Indicators */}
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#24583B] ring-2 ring-[#BEE3C8]" />
              <span className="font-bold text-[#1F2922]">Draft</span>
            </div>
            <span className="text-[10px] font-semibold text-[#24583B] bg-[#EAF5EC] px-2 py-0.5 rounded-full">
              Current
            </span>
          </div>

          <div className="flex items-center gap-2 text-[#7A877E]">
            <span className="w-3 h-3 rounded-full border border-[#C2CCC4]" />
            <span>Submitted</span>
          </div>

          <div className="flex items-center gap-2 text-[#7A877E]">
            <span className="w-3 h-3 rounded-full border border-[#C2CCC4]" />
            <span>Under Review</span>
          </div>

          <div className="flex items-center gap-2 text-[#7A877E]">
            <span className="w-3 h-3 rounded-full border border-[#C2CCC4]" />
            <span>Approved</span>
          </div>

          <div className="flex items-center gap-2 text-[#7A877E]">
            <span className="w-3 h-3 rounded-full border border-[#C2CCC4]" />
            <span>Published</span>
          </div>
        </div>

        <p className="text-[11px] text-[#7A877E] leading-relaxed pt-3 border-t border-[#F0ECE4]">
          Other outcomes: Rejected · Inactive · Expired / Unavailable. The Admin
          reviews each listing and approves or rejects it.
        </p>
      </div>

      {/* Visibility Note Banner */}
      <div className="bg-[#FAF2E6] border border-[#F4DCBE] rounded-xl p-4 shadow-2xs text-xs text-[#4D3A20] leading-relaxed">
        Your listing is visible to Buyers only while your account and subscription
        are in good standing.
      </div>
    </div>
  );
}

"use client";

import React from "react";

export default function ListingStatusSidebar() {
  return (
    <div className="space-y-4 lg:sticky lg:top-4">
      <div className="bg-white border border-[#DDE7CE] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7EEDB]">
          <h3 className="text-sm font-bold text-[#0B3C26]">Listing status</h3>
          <span className="text-xs text-[#54754B] font-medium">Lifecycle</span>
        </div>

        {/* Stepper Status Indicators */}
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#2D8A3E] ring-2 ring-[#C5F340]" />
              <span className="font-bold text-[#0B3C26]">Draft</span>
            </div>
            <span className="text-[10px] font-bold text-[#0B3C26] bg-[#ECF9C4] px-2 py-0.5 rounded-full">
              Current
            </span>
          </div>

          <div className="flex items-center gap-2 text-[#54754B]">
            <span className="w-3 h-3 rounded-full border border-[#B9C9A8]" />
            <span>Submitted</span>
          </div>

          <div className="flex items-center gap-2 text-[#54754B]">
            <span className="w-3 h-3 rounded-full border border-[#B9C9A8]" />
            <span>Under Review</span>
          </div>

          <div className="flex items-center gap-2 text-[#54754B]">
            <span className="w-3 h-3 rounded-full border border-[#B9C9A8]" />
            <span>Approved</span>
          </div>

          <div className="flex items-center gap-2 text-[#54754B]">
            <span className="w-3 h-3 rounded-full border border-[#B9C9A8]" />
            <span>Published</span>
          </div>
        </div>

        <p className="text-[11px] text-[#54754B] leading-relaxed pt-3 border-t border-[#E7EEDB]">
          Other outcomes: Rejected · Inactive · Expired / Unavailable. The Admin
          reviews each listing and approves or rejects it.
        </p>
      </div>

      {/* Visibility Note Banner */}
      <div className="bg-[#F2FAE0] border border-[#C5E37A] rounded-2xl p-4 shadow-2xs text-xs text-[#0B3C26] leading-relaxed">
        Your listing is visible to Buyers only while your account and subscription
        are in good standing.
      </div>
    </div>
  );
}

"use client";

import React from "react";

export default function EventsCoveredCard() {
  return (
    <div className="bg-white border border-[#DDE7CE] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E7EEDB]">
        <h2 className="text-sm font-bold text-[#0B3C26]">Events covered</h2>
        <span className="text-xs text-[#0B3C26] bg-[#ECF9C4] px-2.5 py-0.5 rounded-full font-semibold">
          Activity triggers
        </span>
      </div>

      {/* Account */}
      <div className="space-y-1">
        <div className="text-xs font-bold text-[#0B3C26]">Account</div>
        <p className="text-[11px] text-[#4E6D45] leading-relaxed">
          Registration · Verification · Password reset · Account activation ·
          Account suspension
        </p>
      </div>

      {/* Subscription and payments */}
      <div className="space-y-1 pt-2 border-t border-[#EDF3DF]">
        <div className="text-xs font-bold text-[#0B3C26]">
          Subscription and payments
        </div>
        <p className="text-[11px] text-[#4E6D45] leading-relaxed">
          Purchase · Payment confirmation · Activation · Expiry reminder ·
          Expiry · Renewal · Failed payment
        </p>
      </div>

      {/* Buyer enquiries */}
      <div className="space-y-1 pt-2 border-t border-[#EDF3DF]">
        <div className="text-xs font-bold text-[#0B3C26]">Buyer enquiries</div>
        <p className="text-[11px] text-[#4E6D45] leading-relaxed">
          New Buyer enquiry · Contact request · Business interaction ·
          Communication updates
        </p>
      </div>

      {/* Listings */}
      <div className="space-y-1 pt-2 border-t border-[#EDF3DF]">
        <div className="text-xs font-bold text-[#0B3C26]">Listings</div>
        <p className="text-[11px] text-[#4E6D45] leading-relaxed">
          Approved or rejected by the Admin · Status changes
        </p>
      </div>
    </div>
  );
}

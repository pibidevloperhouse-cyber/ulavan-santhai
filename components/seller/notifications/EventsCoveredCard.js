"use client";

import React from "react";

export default function EventsCoveredCard() {
  return (
    <div className="bg-white border border-[#EAE6DD] rounded-xl p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
        <h2 className="text-sm font-bold text-[#1F2922]">Events covered</h2>
        <span className="text-xs text-[#526458] bg-[#F4F1EA] px-2.5 py-0.5 rounded-full font-medium">
          Activity triggers
        </span>
      </div>

      {/* Account */}
      <div className="space-y-1">
        <div className="text-xs font-bold text-[#1F2922]">Account</div>
        <p className="text-[11px] text-[#637267] leading-relaxed">
          Registration · Verification · Password reset · Account activation ·
          Account suspension
        </p>
      </div>

      {/* Subscription and payments */}
      <div className="space-y-1 pt-2 border-t border-[#F4F1EA]">
        <div className="text-xs font-bold text-[#1F2922]">
          Subscription and payments
        </div>
        <p className="text-[11px] text-[#637267] leading-relaxed">
          Purchase · Payment confirmation · Activation · Expiry reminder ·
          Expiry · Renewal · Failed payment
        </p>
      </div>

      {/* Buyer enquiries */}
      <div className="space-y-1 pt-2 border-t border-[#F4F1EA]">
        <div className="text-xs font-bold text-[#1F2922]">Buyer enquiries</div>
        <p className="text-[11px] text-[#637267] leading-relaxed">
          New Buyer enquiry · Contact request · Business interaction ·
          Communication updates
        </p>
      </div>

      {/* Listings */}
      <div className="space-y-1 pt-2 border-t border-[#F4F1EA]">
        <div className="text-xs font-bold text-[#1F2922]">Listings</div>
        <p className="text-[11px] text-[#637267] leading-relaxed">
          Approved or rejected by the Admin · Status changes
        </p>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import StatusBadge from "../ui/StatusBadge";

export default function CurrentSubscriptionCard({
  subscription,
  onRenew,
}) {
  if (!subscription) return null;

  return (
    <div className="bg-white border border-[#EAE6DD] rounded-xl p-4 sm:p-6 shadow-2xs space-y-5 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F0ECE4]">
        <h2 className="text-sm font-bold text-[#1F2922]">
          Current subscription
        </h2>
        <StatusBadge status={subscription.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-[#78857C] block text-[11px]">Plan</span>
          <span className="font-bold text-[#1F2922] mt-0.5 block">
            {subscription.plan}
          </span>
        </div>
        <div>
          <span className="text-[#78857C] block text-[11px]">Price</span>
          <span className="font-bold text-[#1F2922] mt-0.5 block">
            {subscription.price}
          </span>
        </div>
        <div>
          <span className="text-[#78857C] block text-[11px]">Duration</span>
          <span className="font-bold text-[#1F2922] mt-0.5 block">
            {subscription.duration}
          </span>
        </div>
        <div />
        <div>
          <span className="text-[#78857C] block text-[11px]">Start date</span>
          <span className="font-bold text-[#1F2922] mt-0.5 block">
            {subscription.startDate}
          </span>
        </div>
        <div>
          <span className="text-[#78857C] block text-[11px]">Expiry date</span>
          <span className="font-bold text-[#1F2922] mt-0.5 block">
            {subscription.expiryDate}
          </span>
        </div>
        <div className="col-span-2">
          <span className="text-[#78857C] block text-[11px]">
            Days remaining
          </span>
          <span className="font-bold text-[#1F2922] mt-0.5 block">
            {subscription.daysRemaining} days
          </span>
        </div>
      </div>

      <div className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-lg p-3 text-xs text-[#526056] leading-relaxed">
        Your plan lets you showcase eligible products on the platform, subject
        to platform rules and account status. Price and duration are set by the
        Admin and read from configuration.
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1">
        <button
          type="button"
          onClick={onRenew}
          className="px-4 py-2.5 bg-[#24583B] hover:bg-[#1A432C] text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs text-center cursor-pointer"
        >
          Renew subscription
        </button>
        <a
          href="#payment-history"
          className="px-4 py-2.5 bg-white hover:bg-[#FAF8F3] text-[#38463D] border border-[#D5CEC0] text-xs font-semibold rounded-lg transition-colors text-center cursor-pointer"
        >
          View payment history
        </a>
      </div>

      {/* Possible Subscription Statuses */}
      <div className="pt-3 border-t border-[#F0ECE4] space-y-2">
        <div className="text-[11px] font-semibold text-[#66756B]">
          Possible subscription statuses
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status="Active" />
          <StatusBadge status="Pending Payment" />
          <StatusBadge status="Expired" />
          <StatusBadge status="Cancelled" />
          <StatusBadge status="Suspended" />
          <StatusBadge status="Failed Payment" />
        </div>
      </div>
    </div>
  );
}

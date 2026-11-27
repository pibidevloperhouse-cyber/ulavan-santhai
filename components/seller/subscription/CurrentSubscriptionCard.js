"use client";

import React from "react";
import { LockOpen } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";

export default function CurrentSubscriptionCard({
  subscription,
  unlockedCategories = [],
  lockedCategoryOptions = [],
  onRenew,
  onStartUnlock,
}) {
  if (!subscription) return null;

  return (
    <div className="bg-white border border-[#DDE7CE] rounded-2xl p-4 sm:p-6 shadow-2xs space-y-5 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E7EEDB]">
        <h2 className="text-sm font-extrabold text-[#0B3C26]">
          Current subscription
        </h2>
        <StatusBadge status={subscription.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-[#54754B] block text-[11px]">Plan</span>
          <span className="font-bold text-[#0B3C26] mt-0.5 block">
            {subscription.plan}
          </span>
        </div>
        <div>
          <span className="text-[#54754B] block text-[11px]">Price</span>
          <span className="font-bold text-[#0B3C26] mt-0.5 block">
            {subscription.price}
          </span>
        </div>
        <div>
          <span className="text-[#54754B] block text-[11px]">Duration</span>
          <span className="font-bold text-[#0B3C26] mt-0.5 block">
            {subscription.duration}
          </span>
        </div>
        <div />
        <div>
          <span className="text-[#54754B] block text-[11px]">Start date</span>
          <span className="font-bold text-[#0B3C26] mt-0.5 block">
            {subscription.startDate}
          </span>
        </div>
        <div>
          <span className="text-[#54754B] block text-[11px]">Expiry date</span>
          <span className="font-bold text-[#0B3C26] mt-0.5 block">
            {subscription.expiryDate}
          </span>
        </div>
        <div className="col-span-2">
          <span className="text-[#54754B] block text-[11px]">
            Days remaining
          </span>
          <span className="font-bold text-[#0B3C26] mt-0.5 block">
            {subscription.daysRemaining} days
          </span>
        </div>
      </div>

      {/* Unlocked Classifications Summary */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-[#54754B]">
          Unlocked seller classifications
        </div>
        {unlockedCategories.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {unlockedCategories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ECF9C4] border border-[#C5E37A] text-[11px] font-bold text-[#0B3C26]"
              >
                ✓ {cat}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#4E6D45]">
            No classifications unlocked yet. Upload verification documents to unlock one below.
          </p>
        )}
      </div>

      <div className="bg-[#F5F7EC] border border-[#DDE7CE] rounded-xl p-3 text-xs text-[#4E6D45] leading-relaxed">
        Your plan lets you showcase eligible products on the platform, subject
        to platform rules and account status. Price and duration are set by the
        Admin and read from configuration.
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1">
        <button
          type="button"
          onClick={onRenew}
          className="px-4 py-2.5 bg-[#C5F340] hover:bg-[#d3fc59] text-[#0B3C26] text-xs font-extrabold rounded-xl transition-colors shadow-2xs text-center cursor-pointer"
        >
          Renew subscription
        </button>
        {lockedCategoryOptions.length > 0 && onStartUnlock && (
          <button
            type="button"
            onClick={() => onStartUnlock(lockedCategoryOptions[0].value)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#ECF9C4] hover:bg-[#C5F340] text-[#0B3C26] border border-[#C5E37A] text-xs font-bold rounded-xl transition-colors text-center cursor-pointer"
          >
            <LockOpen className="w-3.5 h-3.5 text-[#2D8A3E]" />
            <span>Unlock category (₹365)</span>
          </button>
        )}
        <a
          href="#payment-history"
          className="px-4 py-2.5 bg-white hover:bg-[#F5F7EC] text-[#0B3C26] border border-[#DDE7CE] text-xs font-bold rounded-xl transition-colors text-center cursor-pointer"
        >
          View payment history
        </a>
      </div>

      {/* Possible Subscription Statuses */}
      <div className="pt-3 border-t border-[#E7EEDB] space-y-2">
        <div className="text-[11px] font-semibold text-[#54754B]">
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

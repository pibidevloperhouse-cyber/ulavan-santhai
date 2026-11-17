"use client";

import React from "react";
import Link from "next/link";

export default function SubscriptionBanner({ daysRemaining = 365 }) {
  return (
    <div className="bg-[#FAF2E6] border border-[#F4DCBE] rounded-xl p-5 shadow-xs">
      <p className="text-xs sm:text-sm text-[#4D3A20] leading-relaxed">
        <span className="font-bold text-[#2E200F]">
          Your subscription is active with {daysRemaining} days remaining.
        </span>{" "}
        Your products stay visible to buyers only while your account and
        subscription are in good standing.
      </p>
      <div className="mt-3.5">
        <Link
          href="/seller/subscription"
          className="inline-flex items-center justify-center px-4 py-2 bg-[#1B4D36] hover:bg-[#133A28] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
        >
          Manage subscription
        </Link>
      </div>
    </div>
  );
}

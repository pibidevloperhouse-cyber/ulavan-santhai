"use client";

import React from "react";
import { PRICING_PLANS } from "@/services/paymentApi";

/**
 * Reusable Component: PlanBenefitsCard
 * Displays the plan overview, benefits list, and pricing details
 * for either Buyer (BUYER_ANNUAL) or Seller (SELLER_ANNUAL).
 */
export default function PlanBenefitsCard({
  role = "buyer",
  planId = "BUYER_ANNUAL",
  className = "",
}) {
  const isBuyer = role === "buyer" || planId.includes("BUYER");
  const targetKey = isBuyer ? "BUYER" : "SELLER";
  const plan = PRICING_PLANS[targetKey] || PRICING_PLANS.BUYER;

  return (
    <div
      className={`bg-[#F4F7F2]/90 border border-[#16a34a]/20 rounded-2xl p-5 sm:p-6 space-y-4 relative overflow-hidden ${className}`}
    >
      <div className="space-y-1">
        <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#16a34a] text-white text-[10px] font-bold uppercase tracking-wider">
          {isBuyer ? "Buyer Verified Plan" : "Seller Annual Membership"}
        </span>
        <h4 className="text-base sm:text-lg font-black text-[#1F4D36]">
          {plan.name}
        </h4>
        <p className="text-xs text-gray-600">{plan.description}</p>
      </div>

      <div className="pt-2 border-t border-[#16a34a]/15">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
          What is included:
        </span>
        <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700">
          {plan.benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-[#16a34a] font-black shrink-0 mt-0.5">✓</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-3 border-t border-[#16a34a]/15 flex items-center justify-between text-xs text-gray-600">
        <span>Platform Membership</span>
        <span className="font-semibold text-gray-900">₹1.00 per day (₹365/year)</span>
      </div>
    </div>
  );
}

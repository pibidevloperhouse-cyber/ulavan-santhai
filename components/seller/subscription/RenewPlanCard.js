"use client";

import React from "react";

export default function RenewPlanCard({
  planPrice = "₹365",
  onPay,
  isProcessing = false,
  paymentNotice = "",
}) {
  return (
    <div className="bg-white border border-[#EAE6DD] rounded-xl p-5 sm:p-6 shadow-2xs space-y-5">
      <div className="pb-3 border-b border-[#F0ECE4]">
        <h2 className="text-sm font-bold text-[#1F2922]">Renew or buy plan</h2>
      </div>

      {/* Plan Radio Option */}
      <div className="border border-[#24583B] bg-[#F5FAF6] rounded-xl p-4 flex items-center justify-between">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="radio"
            name="plan"
            defaultChecked
            className="text-[#24583B] focus:ring-0"
          />
          <span className="text-xs font-bold text-[#1F2922]">
            Seller plan · 1 year
          </span>
        </label>
        <span className="text-xs font-bold text-[#24583B]">{planPrice}</span>
      </div>

      {/* Breakdown */}
      <div className="space-y-2 text-xs pt-1">
        <div className="flex items-center justify-between text-[#68766D]">
          <span>Subtotal</span>
          <span>{planPrice}</span>
        </div>
        <div className="flex items-center justify-between text-[#1F2922] font-bold pt-2 border-t border-[#F0ECE4]">
          <span>Total payable</span>
          <span>{planPrice}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onPay}
        disabled={isProcessing}
        className="w-full py-2.5 bg-[#24583B] hover:bg-[#1A432C] text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs text-center disabled:opacity-60 cursor-pointer"
      >
        {isProcessing ? "Processing..." : `Pay ${planPrice}`}
      </button>

      {paymentNotice && (
        <div className="text-xs text-[#24583B] font-medium bg-[#EBF6EE] p-2.5 rounded-lg text-center">
          {paymentNotice}
        </div>
      )}

      <p className="text-[11px] text-[#7A877E] leading-relaxed">
        You will be taken to the secure payment gateway. Your subscription
        activates after payment is confirmed.
      </p>
    </div>
  );
}

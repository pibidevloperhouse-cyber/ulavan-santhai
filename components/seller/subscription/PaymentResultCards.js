"use client";

import React from "react";
import StatusBadge from "../ui/StatusBadge";

export default function PaymentResultCards({ onRetry }) {
  return (
    <div className="bg-white border border-[#EAE6DD] rounded-xl p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
        <h2 className="text-sm font-bold text-[#1F2922]">
          Payment result screens
        </h2>
        <span className="text-xs text-[#526458] font-medium">
          Gateway Outcomes
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Success */}
        <div className="border border-[#BEE3C8] bg-[#F5FAF6] rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <StatusBadge status="Success" />
            <div className="font-bold text-xs text-[#1F2922]">
              Payment successful
            </div>
            <p className="text-[11px] text-[#4A594E] leading-relaxed">
              Shows the transaction reference and confirms your subscription is
              active. A notification is sent.
            </p>
          </div>
          <div className="text-[11px] text-[#6E7D72] font-mono">
            Status: Confirmed & Active
          </div>
        </div>

        {/* Failed */}
        <div className="border border-[#FAC7C7] bg-[#FCF6F6] rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <StatusBadge status="Failed" />
            <div className="font-bold text-xs text-[#1F2922]">
              Payment failed
            </div>
            <p className="text-[11px] text-[#594A4A] leading-relaxed">
              Access is not activated. The status is recorded and you are
              notified.
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={onRetry}
              className="px-3 py-1.5 bg-[#24583B] hover:bg-[#1A432C] text-white text-[11px] font-semibold rounded-md transition-colors"
            >
              Retry payment
            </button>
          </div>
        </div>

        {/* Pending */}
        <div className="border border-[#FDE0B4] bg-[#FCF9F3] rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <StatusBadge status="Pending" />
            <div className="font-bold text-xs text-[#1F2922]">
              Payment pending
            </div>
            <p className="text-[11px] text-[#59524A] leading-relaxed">
              Waiting for the gateway to confirm. The subscription stays at
              Pending Payment until then.
            </p>
          </div>
        </div>

        {/* Cancelled */}
        <div className="border border-[#DFE3E6] bg-[#FAFBFB] rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <StatusBadge status="Cancelled" />
            <div className="font-bold text-xs text-[#1F2922]">
              Payment cancelled
            </div>
            <p className="text-[11px] text-[#50575D] leading-relaxed">
              You left the gateway before paying. Nothing was charged and you
              can start again.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

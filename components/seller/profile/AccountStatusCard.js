"use client";

import React from "react";
import StatusBadge from "../ui/StatusBadge";

export default function AccountStatusCard({
  accountStatus = "Approved",
  approvedDate = "15 Oct 2026",
}) {
  return (
    <div className="bg-white border border-[#DDE7CE] rounded-2xl p-4 sm:p-6 shadow-2xs space-y-4 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E7EEDB]">
        <h2 className="text-sm font-extrabold text-[#0B3C26]">Account status</h2>
        <span className="text-xs text-[#4E6D45] font-medium">Verification</span>
      </div>

      {/* Current Status Pill */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        <StatusBadge status={accountStatus} />
        <span className="text-xs text-[#4E6D45]">
          Approved by the Admin on {approvedDate}
        </span>
      </div>

      {/* 3 Reference Boxes for Other States */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
        {/* Pending review */}
        <div className="p-3.5 bg-[#FFF9EE] border border-[#FDE0B4] rounded-lg space-y-1">
          <div className="text-xs font-bold text-[#985F10]">Pending review</div>
          <p className="text-[11px] text-[#635540] leading-relaxed">
            Your details are with the Admin. You will be notified of the
            outcome.
          </p>
        </div>

        {/* Rejected */}
        <div className="p-3.5 bg-[#FDF2F2] border border-[#F8C8C2] rounded-lg space-y-1">
          <div className="text-xs font-bold text-[#B92C2C]">Rejected</div>
          <p className="text-[11px] text-[#664646] leading-relaxed">
            Your Seller account was not approved. Contact support for next steps.
          </p>
        </div>

        {/* Suspended or blocked */}
        <div className="p-3.5 bg-[#FDF2F2] border border-[#F8C8C2] rounded-lg space-y-1">
          <div className="text-xs font-bold text-[#B92C2C]">
            Suspended or blocked
          </div>
          <p className="text-[11px] text-[#664646] leading-relaxed">
            Your account is restricted by the Admin and your products are hidden
            from Buyers.
          </p>
        </div>
      </div>

      <p className="text-[10px] text-[#54754B]">
        The three boxes above show the messages used for the other account
        states.
      </p>
    </div>
  );
}

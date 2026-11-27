"use client";

import React from "react";
import { Mail } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";

export default function EnquiryList({
  enquiries = [],
  selectedId,
  onSelectEnquiry,
}) {
  if (enquiries.length === 0) {
    return (
      <div className="bg-white border border-[#DDE7CE] rounded-2xl p-10 text-center space-y-2 shadow-xs">
        <div className="w-10 h-10 rounded-full bg-[#ECF9C4] text-[#0B3C26] flex items-center justify-center mx-auto">
          <Mail className="w-5 h-5" />
        </div>
        <div className="text-xs font-bold text-[#0B3C26]">
          No buyer enquiries
        </div>
        <p className="text-xs text-[#4E6D45] leading-relaxed max-w-xs mx-auto">
          When buyers send queries about your products, you will see them listed here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#DDE7CE] rounded-2xl overflow-hidden shadow-xs divide-y divide-[#EDF3DF] min-w-0">
      {enquiries.map((item) => {
        const isSelected = item.id === selectedId;
        return (
          <div
            key={item.id}
            onClick={() => onSelectEnquiry(item.id)}
            className={`p-3.5 sm:p-4 cursor-pointer transition-colors ${
              isSelected
                ? "bg-[#ECF9C4]/55 border-l-4 border-l-[#2D8A3E]"
                : "hover:bg-[#F5F7EC]"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="font-bold text-xs text-[#0B3C26] truncate">
                {item.buyerName}
              </div>
              <span className="text-xs text-[#54754B] shrink-0 font-medium">
                {item.timeAgo}
              </span>
            </div>

            <div className="text-xs text-[#2D8A3E] font-semibold mt-0.5 truncate">
              {item.productName}
            </div>

            <p className="text-xs text-[#3C5840] mt-1 line-clamp-2 leading-relaxed font-normal">
              {item.message}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <StatusBadge status={item.status} />
              <StatusBadge status={item.enquiryType} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

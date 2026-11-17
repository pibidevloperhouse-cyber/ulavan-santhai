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
      <div className="bg-white border border-[#E5E0D5] rounded-xl p-10 text-center space-y-2 shadow-xs">
        <div className="w-10 h-10 rounded-full bg-[#F3F4F6] text-[#6B7280] flex items-center justify-center mx-auto">
          <Mail className="w-5 h-5" />
        </div>
        <div className="text-xs font-bold text-[#111827]">
          No buyer enquiries
        </div>
        <p className="text-xs text-[#6B7280] leading-relaxed max-w-xs mx-auto">
          When buyers send queries about your products, you will see them listed here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E5E0D5] rounded-xl overflow-hidden shadow-xs divide-y divide-[#F0EDE6]">
      {enquiries.map((item) => {
        const isSelected = item.id === selectedId;
        return (
          <div
            key={item.id}
            onClick={() => onSelectEnquiry(item.id)}
            className={`p-4 cursor-pointer transition-colors ${
              isSelected
                ? "bg-[#FAF7F0] border-l-4 border-l-[#1B4D36]"
                : "hover:bg-[#FAF9F6]"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="font-bold text-xs text-[#111827]">
                {item.buyerName}
              </div>
              <span className="text-xs text-[#9CA3AF] shrink-0 font-medium">
                {item.timeAgo}
              </span>
            </div>

            <div className="text-xs text-[#1B4D36] font-semibold mt-0.5">
              {item.productName}
            </div>

            <p className="text-xs text-[#4B5563] mt-1 line-clamp-2 leading-relaxed font-normal">
              {item.message}
            </p>

            <div className="flex items-center gap-1.5 mt-2.5">
              <StatusBadge status={item.status} />
              <StatusBadge status={item.enquiryType} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

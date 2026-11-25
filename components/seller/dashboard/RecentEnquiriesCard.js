"use client";

import React from "react";
import Link from "next/link";
import { Mail, ChevronRight } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";

export default function RecentEnquiriesCard({ enquiries = [] }) {
  return (
    <div className="bg-white border border-[#E5E0D5] rounded-xl p-4 shadow-2xs space-y-3 min-w-0">
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#F0ECE4]">
        <h2 className="text-xs sm:text-sm font-bold text-[#111827] truncate">
          Recent Buyer enquiries
        </h2>
        <Link
          href="/seller/enquiries"
          className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#174B35] hover:underline shrink-0"
        >
          <span>View all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {enquiries.length === 0 ? (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#FAF9F6] border border-[#ECE8DF]">
          <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E0D5] text-[#6B7280] flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-[#1F2922]">
              No buyer enquiries yet
            </div>
            <p className="text-[11px] text-[#6B7280] leading-snug mt-0.5">
              Incoming enquiries for your produce will show up here.
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-[#F4F1EA]">
          {enquiries.map((enq) => (
            <Link
              key={enq.id}
              href="/seller/enquiries"
              className="py-2.5 block space-y-1 hover:bg-[#FAF9F6] -mx-1.5 px-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 xs:gap-2">
                <div className="text-xs font-semibold text-[#111827] truncate">
                  {enq.buyerName}{" "}
                  <span className="text-[#6B7280] font-normal">
                    · {enq.productName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 self-start xs:self-auto">
                  <StatusBadge status={enq.status} />
                  <span className="text-[11px] text-[#9CA3AF]">
                    {enq.timeAgo}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-[#4B5563] leading-snug line-clamp-2">
                {enq.message}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

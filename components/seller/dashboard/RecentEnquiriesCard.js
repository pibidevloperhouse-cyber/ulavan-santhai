"use client";

import React from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";

export default function RecentEnquiriesCard({ enquiries = [] }) {
  return (
    <div className="bg-white border border-[#E5E0D5] rounded-xl p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
          <h2 className="text-sm font-bold text-[#1F2937]">
            Recent Buyer enquiries
          </h2>
          <Link
            href="/seller/enquiries"
            className="text-xs font-semibold text-[#1B4D36] hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="divide-y divide-[#F4F1EA]">
          {enquiries.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#F3F4F6] text-[#6B7280] flex items-center justify-center mx-auto">
                <Mail className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-[#374151]">
                No buyer enquiries yet
              </div>
              <p className="text-xs text-[#6B7280] max-w-xs mx-auto leading-relaxed">
                When interested buyers reach out about your agricultural produce,
                their messages will appear here.
              </p>
            </div>
          ) : (
            enquiries.map((enq) => (
              <Link
                key={enq.id}
                href="/seller/enquiries"
                className="py-3.5 block space-y-1 hover:bg-[#FAF9F6] -mx-2 px-2 rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-semibold text-[#111827]">
                    {enq.buyerName}{" "}
                    <span className="text-[#6B7280] font-normal">
                      · {enq.productName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <StatusBadge status={enq.status} />
                    <span className="text-xs text-[#9CA3AF]">
                      {enq.timeAgo}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#4B5563] leading-relaxed line-clamp-2">
                  {enq.message}
                </p>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

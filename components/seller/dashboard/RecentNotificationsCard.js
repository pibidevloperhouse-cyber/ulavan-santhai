"use client";

import React from "react";
import Link from "next/link";
import { Bell, ChevronRight } from "lucide-react";

export default function RecentNotificationsCard({ notifications = [] }) {
  return (
    <div className="bg-white border border-[#E5E0D5] rounded-xl p-4 shadow-2xs space-y-3 min-w-0">
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#F0ECE4]">
        <h2 className="text-xs sm:text-sm font-bold text-[#111827] truncate">
          Recent notifications
        </h2>
        <Link
          href="/seller/notifications"
          className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#174B35] hover:underline shrink-0"
        >
          <span>View all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {notifications.length === 0 ? (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#FAF9F6] border border-[#ECE8DF]">
          <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E0D5] text-[#6B7280] flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-[#1F2922]">
              No new notifications
            </div>
            <p className="text-[11px] text-[#6B7280] leading-snug mt-0.5">
              Listing reviews, payment updates, and alerts appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-[#F4F1EA]">
          {notifications.map((notif) => (
            <Link
              key={notif.id}
              href="/seller/notifications"
              className="py-2.5 flex flex-col xs:flex-row xs:items-start justify-between gap-1.5 xs:gap-3 hover:bg-[#FAF9F6] -mx-1.5 px-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-2 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#174B35] mt-1.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#111827] truncate">
                    {notif.title}
                  </div>
                  <p className="text-[11px] text-[#4B5563] mt-0.5 leading-snug">
                    {notif.message}
                  </p>
                </div>
              </div>
              <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] shrink-0 whitespace-nowrap self-end xs:self-auto">
                {notif.time}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

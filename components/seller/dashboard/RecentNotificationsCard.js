"use client";

import React from "react";
import Link from "next/link";
import { Bell, ChevronRight } from "lucide-react";

export default function RecentNotificationsCard({ notifications = [] }) {
  return (
    <div className="bg-white border border-[#DDE7CE] rounded-2xl p-4 shadow-2xs space-y-3 min-w-0">
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#E7EEDB]">
        <h2 className="text-xs sm:text-sm font-extrabold text-[#0B3C26] truncate">
          Recent notifications
        </h2>
        <Link
          href="/seller/notifications"
          className="inline-flex items-center gap-0.5 text-xs font-bold text-[#2D8A3E] hover:underline shrink-0"
        >
          <span>View all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {notifications.length === 0 ? (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F5F7EC] border border-[#DDE7CE]">
          <div className="w-8 h-8 rounded-lg bg-[#ECF9C4] border border-[#C5E37A] text-[#0B3C26] flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#0B3C26]">
              No new notifications
            </div>
            <p className="text-[11px] text-[#4E6D45] leading-snug mt-0.5">
              Listing reviews, payment updates, and alerts appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-[#EDF3DF]">
          {notifications.map((notif) => (
            <Link
              key={notif.id}
              href="/seller/notifications"
              className="py-2.5 flex flex-col xs:flex-row xs:items-start justify-between gap-1.5 xs:gap-3 hover:bg-[#F5F7EC] -mx-1.5 px-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-2 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#65B72E] mt-1.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#0B3C26] truncate">
                    {notif.title}
                  </div>
                  <p className="text-[11px] text-[#3C5840] mt-0.5 leading-snug">
                    {notif.message}
                  </p>
                </div>
              </div>
              <span className="text-[10px] sm:text-[11px] text-[#54754B] shrink-0 whitespace-nowrap self-end xs:self-auto">
                {notif.time}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

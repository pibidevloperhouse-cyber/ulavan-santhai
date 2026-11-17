"use client";

import React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

export default function RecentNotificationsCard({ notifications = [] }) {
  return (
    <div className="bg-white border border-[#E5E0D5] rounded-xl p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
          <h2 className="text-sm font-bold text-[#1F2937]">
            Recent notifications
          </h2>
          <Link
            href="/seller/notifications"
            className="text-xs font-semibold text-[#1B4D36] hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="divide-y divide-[#F4F1EA]">
          {notifications.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#F3F4F6] text-[#6B7280] flex items-center justify-center mx-auto">
                <Bell className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-[#374151]">
                No new notifications
              </div>
              <p className="text-xs text-[#6B7280] max-w-xs mx-auto leading-relaxed">
                Platform updates, product review outcomes, and payment alerts will
                show up here.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <Link
                key={notif.id}
                href="/seller/notifications"
                className="py-3.5 flex items-start justify-between gap-3 hover:bg-[#FAF9F6] -mx-2 px-2 rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#1B4D36] mt-1.5 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-[#111827]">
                      {notif.title}
                    </div>
                    <p className="text-xs text-[#4B5563] mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-[#9CA3AF] shrink-0 whitespace-nowrap">
                  {notif.time}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

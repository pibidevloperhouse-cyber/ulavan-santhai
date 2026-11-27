"use client";

import React from "react";
import StatusBadge from "../ui/StatusBadge";

export default function NotificationList({
  notifications = [],
  onToggleRead,
}) {
  if (notifications.length === 0) {
    return (
      <div className="bg-white border border-[#DDE7CE] rounded-2xl p-8 text-center text-xs text-[#4E6D45] shadow-xs">
        No notifications in this category.
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#DDE7CE] rounded-2xl overflow-hidden shadow-xs divide-y divide-[#EDF3DF]">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          onClick={() => onToggleRead && onToggleRead(notif.id)}
          className={`p-3.5 sm:p-4 flex flex-col xs:flex-row xs:items-start justify-between gap-2.5 xs:gap-3 cursor-pointer transition-colors ${
            notif.unread ? "bg-[#F5F9E8]" : "hover:bg-[#F5F7EC]"
          }`}
        >
          <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
            {/* Unread dot indicator */}
            <span
              className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${
                notif.unread
                  ? "bg-[#65B72E]"
                  : "border border-[#B9C9A8] bg-transparent"
              }`}
            />

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="font-bold text-xs text-[#0B3C26]">
                  {notif.title}
                </span>
                <StatusBadge status={notif.category} />
              </div>
              <p className="text-xs text-[#3C5840] mt-1 leading-relaxed">
                {notif.message}
              </p>
            </div>
          </div>

          <span className="text-[11px] text-[#54754B] shrink-0 whitespace-nowrap self-end xs:self-auto">
            {notif.time}
          </span>
        </div>
      ))}
    </div>
  );
}

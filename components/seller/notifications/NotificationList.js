"use client";

import React from "react";
import StatusBadge from "../ui/StatusBadge";

export default function NotificationList({
  notifications = [],
  onToggleRead,
}) {
  if (notifications.length === 0) {
    return (
      <div className="bg-white border border-[#EAE6DD] rounded-xl p-8 text-center text-xs text-[#7A877E] shadow-2xs">
        No notifications in this category.
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#EAE6DD] rounded-xl overflow-hidden shadow-2xs divide-y divide-[#F0EDE6]">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          onClick={() => onToggleRead && onToggleRead(notif.id)}
          className={`p-4 flex items-start justify-between gap-3 cursor-pointer transition-colors ${
            notif.unread ? "bg-[#FAF8F2]" : "hover:bg-[#FAF9F6]"
          }`}
        >
          <div className="flex items-start gap-3">
            {/* Unread dot indicator */}
            <span
              className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${
                notif.unread
                  ? "bg-[#24583B]"
                  : "border border-[#A8B5AB] bg-transparent"
              }`}
            />

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs text-[#1F2922]">
                  {notif.title}
                </span>
                <StatusBadge status={notif.category} />
              </div>
              <p className="text-xs text-[#5D6B61] mt-1 leading-relaxed">
                {notif.message}
              </p>
            </div>
          </div>

          <span className="text-[11px] text-[#8C9890] shrink-0 whitespace-nowrap">
            {notif.time}
          </span>
        </div>
      ))}
    </div>
  );
}

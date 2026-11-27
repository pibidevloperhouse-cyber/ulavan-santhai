"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, Mail, ChevronRight } from "lucide-react";

const EMPTY_LIST = [];

/**
 * Clean top-bar notification & enquiry popovers.
 * Works seamlessly in both the fixed mobile navbar and desktop SellerHeader.
 */
export default function HeaderAlertsPopover({ compact = false }) {
  const [openMenu, setOpenMenu] = useState(null); // "enquiries" | "notifications" | null
  const containerRef = useRef(null);

  const unreadNotifications = EMPTY_LIST.filter(
    (n) => n.unread
  ).length;
  const newEnquiries = EMPTY_LIST.filter(
    (e) => e.status === "New"
  ).length;

  useEffect(() => {
    if (!openMenu) return;

    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") setOpenMenu(null);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [openMenu]);

  const toggleMenu = (name) => {
    setOpenMenu((prev) => (prev === name ? null : name));
  };

  const buttonSize = compact ? "w-8 h-8" : "w-9 h-9";

  return (
    <div
      ref={containerRef}
      className="relative flex items-center gap-1.5 sm:gap-2 shrink-0"
    >
      {/* Buyer Enquiries Trigger */}
      <button
        type="button"
        onClick={() => toggleMenu("enquiries")}
        aria-label="Buyer enquiries"
        aria-expanded={openMenu === "enquiries"}
        title="Buyer enquiries"
        className={`relative ${buttonSize} rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${openMenu === "enquiries"
          ? "bg-[#ECF9C4] border-[#8DC63F] text-[#0B3C26]"
          : "bg-white border-[#DDE7CE] text-[#3C5840] hover:bg-[#F5F7EC] hover:text-[#0B3C26]"
          }`}
      >
        <Mail className="w-4 h-4" />
        {newEnquiries > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#C5F340] text-[#0B3C26] text-[10px] font-bold flex items-center justify-center leading-none">
            {newEnquiries}
          </span>
        )}
      </button>

      {/* Notifications Trigger */}
      <button
        type="button"
        onClick={() => toggleMenu("notifications")}
        aria-label="Notifications"
        aria-expanded={openMenu === "notifications"}
        title="Notifications"
        className={`relative ${buttonSize} rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${openMenu === "notifications"
          ? "bg-[#ECF9C4] border-[#8DC63F] text-[#0B3C26]"
          : "bg-white border-[#DDE7CE] text-[#3C5840] hover:bg-[#F5F7EC] hover:text-[#0B3C26]"
          }`}
      >
        <Bell className="w-4 h-4" />
        {unreadNotifications > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#0B3C26] text-[#C5F340] text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadNotifications}
          </span>
        )}
      </button>

      {/* Enquiries Popover Panel */}
      {openMenu === "enquiries" && (
        <div className="fixed inset-x-3 top-[60px] max-w-sm ml-auto lg:absolute lg:inset-auto lg:right-0 lg:top-full lg:mt-2 lg:w-80 bg-white border border-[#DDE7CE] rounded-2xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E7EEDB] flex items-center justify-between bg-[#F2F7E6]">
            <span className="text-xs font-bold text-[#0B3C26]">
              Buyer enquiries
            </span>
            <Link
              href="/seller/enquiries"
              onClick={() => setOpenMenu(null)}
              className="text-[11px] font-semibold text-[#174B35] hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-[#EDF3DF]">
            {EMPTY_LIST.length === 0 ? (
              <div className="px-4 py-5 text-center space-y-1">
                <p className="text-xs font-semibold text-[#0B3C26]">
                  No buyer enquiries yet
                </p>
                <p className="text-[11px] text-[#54754B] leading-relaxed">
                  Buyer enquiries and bulk quote requests appear here.
                </p>
              </div>
            ) : (
              EMPTY_LIST.slice(0, 4).map((enq) => (
                <Link
                  key={enq.id}
                  href="/seller/enquiries"
                  onClick={() => setOpenMenu(null)}
                  className="block px-4 py-3 hover:bg-[#F5F7EC] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[#0B3C26] truncate">
                      {enq.buyerName}
                    </span>
                    <span className="text-[10px] text-[#54754B] shrink-0">
                      {enq.timeAgo}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#4E6D45] mt-0.5 line-clamp-1">
                    {enq.productName} · {enq.message}
                  </p>
                </Link>
              ))
            )}
          </div>

          <Link
            href="/seller/enquiries"
            onClick={() => setOpenMenu(null)}
            className="px-4 py-2.5 border-t border-[#E7EEDB] bg-[#F5F7EC] flex items-center justify-between text-xs font-semibold text-[#0B3C26] hover:bg-[#ECF6D2] transition-colors"
          >
            <span>Open enquiry inbox</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Notifications Popover Panel */}
      {openMenu === "notifications" && (
        <div className="fixed inset-x-3 top-[60px] max-w-sm ml-auto lg:absolute lg:inset-auto lg:right-0 lg:top-full lg:mt-2 lg:w-80 bg-white border border-[#DDE7CE] rounded-2xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E7EEDB] flex items-center justify-between bg-[#F2F7E6]">
            <span className="text-xs font-bold text-[#0B3C26]">
              Notifications
            </span>
            <Link
              href="/seller/notifications"
              onClick={() => setOpenMenu(null)}
              className="text-[11px] font-semibold text-[#174B35] hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-[#EDF3DF]">
            {EMPTY_LIST.length === 0 ? (
              <div className="px-4 py-5 text-center space-y-1">
                <p className="text-xs font-semibold text-[#0B3C26]">
                  No unread notifications
                </p>
                <p className="text-[11px] text-[#54754B] leading-relaxed">
                  Listing reviews, payments, and account alerts appear here.
                </p>
              </div>
            ) : (
              EMPTY_LIST.slice(0, 4).map((notif) => (
                <Link
                  key={notif.id}
                  href="/seller/notifications"
                  onClick={() => setOpenMenu(null)}
                  className="block px-4 py-3 hover:bg-[#F5F7EC] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[#0B3C26] truncate">
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-[#54754B] shrink-0">
                      {notif.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#4E6D45] mt-0.5 line-clamp-1">
                    {notif.message}
                  </p>
                </Link>
              ))
            )}
          </div>

          <Link
            href="/seller/notifications"
            onClick={() => setOpenMenu(null)}
            className="px-4 py-2.5 border-t border-[#E7EEDB] bg-[#F5F7EC] flex items-center justify-between text-xs font-semibold text-[#0B3C26] hover:bg-[#ECF6D2] transition-colors"
          >
            <span>View all notifications</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";

export default function BuyerRoleAndChannelsCard({
  useAsBuyerToo,
  onToggleBuyerRole,
  notificationChannels,
  onToggleChannel,
  onLogout,
}) {
  return (
    <div className="bg-white border border-[#EAE6DD] rounded-xl p-4 sm:p-6 shadow-2xs space-y-5 min-w-0">
      {/* Use this account as a Buyer too */}
      <div className="space-y-1.5 pb-4 border-b border-[#F0ECE4]">
        <div className="text-xs font-bold text-[#1F2922]">
          Use this account as a Buyer too
        </div>
        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#38453D] pt-1">
          <input
            type="checkbox"
            checked={useAsBuyerToo}
            onChange={(e) => onToggleBuyerRole(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded text-[#24583B] focus:ring-0 shrink-0"
          />
          <span className="font-semibold text-[#1F2922] leading-relaxed">
            Allow me to browse and source products as a Buyer with the same
            login
          </span>
        </label>
        <p className="text-[11px] text-[#7A877E]">
          One registered user can act as both Buyer and Seller.
        </p>
      </div>

      {/* Notification channels */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-[#1F2922]">
          Notification channels
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 text-xs text-[#38453D]">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationChannels?.inApp}
              onChange={() => onToggleChannel("inApp")}
              className="w-4 h-4 rounded text-[#24583B] focus:ring-0"
            />
            <span>In-app</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationChannels?.email}
              onChange={() => onToggleChannel("email")}
              className="w-4 h-4 rounded text-[#24583B] focus:ring-0"
            />
            <span>Email</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationChannels?.sms}
              onChange={() => onToggleChannel("sms")}
              className="w-4 h-4 rounded text-[#24583B] focus:ring-0"
            />
            <span>SMS</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationChannels?.push}
              onChange={() => onToggleChannel("push")}
              className="w-4 h-4 rounded text-[#24583B] focus:ring-0"
            />
            <span>Push (mobile app)</span>
          </label>
        </div>
        <p className="text-[11px] text-[#7A877E] pt-1">
          Available notification channels are configured for your account.
        </p>
      </div>

      {/* Legal & Logout Footer Links */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#F0ECE4] text-xs">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[#5A685F]">
          <Link href="/privacy" className="hover:text-[#1F2922]">
            Privacy Policy
          </Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-[#1F2922]">
            Terms and Conditions
          </Link>
          <span>·</span>
          <Link href="/help" className="hover:text-[#1F2922]">
            Help and FAQs
          </Link>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="font-bold text-[#C53030] hover:underline cursor-pointer"
        >
          Log out
        </button>
      </div>
    </div>
  );
}

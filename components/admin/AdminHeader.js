"use client";

import React from "react";
import Link from "next/link";
import { Menu, Bell, Shield, ExternalLink } from "lucide-react";

export default function AdminHeader({
  activeTitle = "Dashboard",
  onMenuToggle,
  pendingCount = 4,
}) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 sm:px-6 py-3 shadow-2xs">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#174B35] tracking-tight flex items-center gap-2">
              <span>{activeTitle}</span>
              {pendingCount > 0 && activeTitle === "Dashboard" && (
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full animate-pulse">
                  {pendingCount} Pending Reviews
                </span>
              )}
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">
              Ulavan Santhai Direct Agricultural Trade &bull; Central Control
            </p>
          </div>
        </div>

        {/* Right Header Badges */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <Link
            href="/"
            target="_blank"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#174B35] text-xs font-bold border border-emerald-200/80 transition-colors shadow-2xs"
          >
            <span>Live Marketplace</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* Quick Notification alert */}
          <div className="relative">
            <button
              type="button"
              className="p-2 rounded-xl text-gray-600 hover:text-[#174B35] hover:bg-emerald-50 transition-colors cursor-pointer border border-gray-200 shadow-2xs"
              title="Verification Alerts"
            >
              <Bell className="w-4 h-4" />
            </button>
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                {pendingCount}
              </span>
            )}
          </div>

          {/* Admin Profile Badge */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-[#174B35] text-white flex items-center justify-center font-black text-xs shadow-xs">
              AD
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <span className="text-xs font-bold text-gray-900 block">Administrator</span>
              <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" /> Super Admin
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

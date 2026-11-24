"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  Store,
  Users,
  PackageCheck,
  Layers,
  CreditCard,
  ReceiptIndianRupee,
  FileText,
  BarChart3,
  ShieldCheck,
  Settings,
  LogOut,
  ExternalLink,
  X,
} from "lucide-react";

export const ADMIN_NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "sellers", label: "Sellers", icon: Store },
  { id: "buyers", label: "Buyers", icon: Users },
  { id: "products", label: "Products", icon: PackageCheck },
  { id: "categories", label: "Categories and attributes", icon: Layers },
  { id: "subscriptions", label: "Subscriptions and pricing", icon: CreditCard },
  { id: "payments", label: "Payments", icon: ReceiptIndianRupee },
  { id: "content", label: "Content", icon: FileText },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "audit", label: "Audit log", icon: ShieldCheck },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar({
  activeTab = "dashboard",
  setActiveTab,
  isMobileOpen = false,
  setIsMobileOpen,
}) {
  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#132E20] text-white select-none">
      {/* Brand Header */}
      <div className="bg-white px-4 py-3.5 border-b border-gray-200 flex items-center justify-between shrink-0">
        <Link href="/admin" className="flex items-center justify-between w-full group cursor-pointer">
          <Image
            src="/images/ulavan-mart-animated.gif"
            alt="Ulavan Mart"
            width={719}
            height={234}
            unoptimized
            priority
            className="w-[145px] h-auto object-contain transition-transform group-hover:scale-[1.02]"
          />
          <span className="text-[10px] font-extrabold tracking-widest text-[#174B35] uppercase px-2 py-0.5 rounded-md bg-[#E8F0E3] border border-[#729B59]/40 shrink-0 ml-2">
            ADMIN
          </span>
        </Link>

        {setIsMobileOpen && (
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden ml-2 p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto min-h-0">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#7E9E81] px-3 mb-2">
          Management Controls
        </div>

        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-left ${
                isActive
                  ? "bg-[#24583B] text-white shadow-sm shadow-emerald-950/20 translate-x-1"
                  : "text-[#B4CBB7] hover:bg-[#1A412D] hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-[#7E9E81]"}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer with Quick Actions */}
      <div className="p-4 border-t border-[#1D4430] bg-[#0E2318] shrink-0 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[#9DB9A0] font-medium">Ulavan Portal Live</span>
          </div>
          <Link
            href="/"
            target="_blank"
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>View Site</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="pt-2 border-t border-[#1D4430]/60 flex items-center justify-between">
          <div className="text-left">
            <div className="text-xs font-bold text-white truncate">Administrator</div>
            <div className="text-[10px] text-[#7E9E81]">Super Admin Control</div>
          </div>

          <Link
            href="/admin/login"
            title="Log out of admin"
            className="p-1.5 rounded-lg text-[#7E9E81] hover:text-white hover:bg-[#1A412D] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 shadow-md">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-xs h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

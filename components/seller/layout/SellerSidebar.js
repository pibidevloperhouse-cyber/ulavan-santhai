"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  Mail,
  CreditCard,
  Bell,
  User,
  X,
} from "lucide-react";

export default function SellerSidebar({
  isOpen = false,
  onClose,
  sellerName = "Seller",
  sellerType = "Farmer",
  enquiryCount = 0,
  notificationCount = 0,
}) {
  const pathname = usePathname() || "/seller/dashboard";

  const navItems = [
    {
      name: "Dashboard",
      href: "/seller/dashboard",
      icon: Home,
    },
    {
      name: "My products",
      href: "/seller/products",
      icon: Package,
    },
    {
      name: "Buyer enquiries",
      href: "/seller/enquiries",
      icon: Mail,
      badge: enquiryCount,
      badgeStyle: "bg-[#E6A93B] text-white font-bold",
    },
    {
      name: "Subscription and payments",
      href: "/seller/subscription",
      icon: CreditCard,
    },
    {
      name: "Notifications",
      href: "/seller/notifications",
      icon: Bell,
      badge: notificationCount,
      badgeStyle: "bg-[#E6A93B] text-white font-bold",
    },
    {
      name: "Profile and settings",
      href: "/seller/profile",
      icon: User,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#132E20] text-white select-none">
      {/* Brand Header */}
      <div className="p-5 pb-4 border-b border-[#1D4430] flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#24583B] flex items-center justify-center font-black text-white text-base shadow-xs">
              U
            </div>
            <span className="font-bold tracking-tight text-white text-base">
              Ulavan Santhai
            </span>
          </div>
          <div className="text-[11px] font-semibold tracking-wider text-[#7E9E81] uppercase mt-2">
            SELLER
          </div>
        </div>

        {/* Close button on mobile */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md text-[#7E9E81] hover:text-white hover:bg-[#1D4430] cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto min-h-0">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/seller/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-[#24583B] text-white font-medium shadow-xs"
                  : "text-[#9EB5A0] hover:bg-[#1B3F2C] hover:text-white font-normal"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-white" : "text-[#8EA990]"
                  }`}
                />
                <span className="truncate leading-tight">{item.name}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`ml-2 shrink-0 rounded-full text-xs px-2 py-0.2 leading-tight ${
                    item.badgeStyle || "bg-[#E6A93B] text-white"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer with Seller Details */}
      <div className="p-4 border-t border-[#1D4430] bg-[#0F261A] shrink-0">
        <div className="text-sm font-medium text-white truncate">
          {sellerName}
        </div>
        <div className="text-xs text-[#7E9E81] mt-0.5">
          Seller type: {sellerType}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar - Stays pinned when page scrolls */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 lg:z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative w-72 max-w-xs h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

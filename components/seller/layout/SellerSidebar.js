"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Package,
  Mail,
  CreditCard,
  Bell,
  User,
  X,
  LogOut,
  ChevronRight,
} from "lucide-react";

export default function SellerSidebar({
  isOpen = false,
  onClose,
  sellerName = "Seller",
  sellerType = "Farmer",
  enquiryCount = 0,
  notificationCount = 0,
}) {
  const router = useRouter();
  const pathname = usePathname() || "/seller/dashboard";

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      localStorage.removeItem("ulavan_auth_token");
      localStorage.removeItem("ulavan_registered_user");
      localStorage.removeItem("token");
    }
    if (onClose) onClose();
    router.push("/login");
  };

  const navGroups = [
    {
      label: "Workspace",
      items: [
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
        },
      ],
    },
    {
      label: "Account",
      items: [
        {
          name: "Subscription & billing",
          href: "/seller/subscription",
          icon: CreditCard,
        },
        {
          name: "Notifications",
          href: "/seller/notifications",
          icon: Bell,
          badge: notificationCount,
        },
        {
          name: "Profile & settings",
          href: "/seller/profile",
          icon: User,
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white text-[#0B3C26] select-none border-r border-[#0B3C26]/10">
      {/* Brand Header */}
      <div className="px-4 py-4 border-b border-[#F5F5EB] flex items-center justify-between shrink-0">
        <Link href="/seller/dashboard" className="flex items-center justify-between w-full group cursor-pointer">
          <Image
            src="/images/ulavan-mart-animated.gif"
            alt="Ulavan Mart"
            width={719}
            height={234}
            unoptimized
            priority
            className="w-[140px] h-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
          />
          <span className="text-[10px] font-extrabold tracking-widest text-[#0B3C26] uppercase px-2 py-0.5 rounded-full bg-[#C5F340] border border-[#0B3C26]/15 shrink-0 ml-2">
            SELLER
          </span>
        </Link>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden ml-2 p-1.5 rounded-lg text-[#0B3C26]/70 hover:text-[#0B3C26] hover:bg-[#F5F5EB] cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3.5 py-5 space-y-6 overflow-y-auto min-h-0">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1.5">
            <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#54754B]">
              {group.label}
            </div>
            {group.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/seller/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[13.5px] transition-all duration-150 group ${
                    isActive
                      ? "bg-[#C5F340] text-[#0B3C26] font-extrabold shadow-xs ring-1 ring-[#0B3C26]/10"
                      : "text-[#2A4D36] hover:bg-[#F5F5EB] hover:text-[#0B3C26] font-semibold"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-[#0B3C26] stroke-[2.4]" : "text-[#54754B] group-hover:text-[#0B3C26]"
                      }`}
                    />
                    <span className="truncate leading-tight">{item.name}</span>
                  </div>

                  {item.badge !== undefined ? (
                    <span
                      className={`ml-2 shrink-0 rounded-full font-space text-[11px] font-bold px-2 py-0.5 leading-none ${
                        isActive
                          ? "bg-[#0B3C26] text-[#C5F340]"
                          : "bg-[#F5F5EB] text-[#0B3C26] ring-1 ring-[#0B3C26]/10"
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : (
                    isActive && <ChevronRight className="w-3.5 h-3.5 text-[#0B3C26] shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sidebar Footer: Warm Cream Seller Card */}
      <div className="p-3.5 border-t border-[#F5F5EB] shrink-0">
        <div className="flex items-center justify-between gap-2.5 p-2.5 rounded-2xl bg-[#F5F5EB] border border-[#0B3C26]/10">
          <div className="w-9 h-9 rounded-xl bg-[#0B3C26] text-[#C5F340] font-extrabold text-xs flex items-center justify-center shrink-0">
            {(sellerName || "S").slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-extrabold text-[#0B3C26] truncate">
              {sellerName}
            </div>
            <div className="text-[11px] font-medium text-[#54754B] truncate">
              {sellerType} Account
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
            className="w-8 h-8 rounded-full bg-white hover:bg-[#0B3C26] text-[#0B3C26] hover:text-white border border-[#0B3C26]/15 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 lg:z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
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

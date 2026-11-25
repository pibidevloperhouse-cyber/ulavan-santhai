"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import SellerSidebar from "@/components/seller/layout/SellerSidebar";
import HeaderAlertsPopover from "@/components/seller/layout/HeaderAlertsPopover";
import { SellerProvider, useSeller } from "@/components/seller/layout/SellerContext";
import { useSessionUser } from "@/services/sessionAuth";
import { getDynamicSellerProfile } from "@/data/sellerPortalData";

function SellerLayoutShell({ children }) {
  const { isMobileMenuOpen, closeMobileMenu, openMobileMenu } = useSeller();
  const sessionUser = useSessionUser();
  const profile = getDynamicSellerProfile(sessionUser);

  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#1F2922] pt-14 lg:pt-0 overflow-x-clip">
      {/* Mobile Top Header - fixed at top on mobile/tablet so it never scrolls out of view */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white text-gray-900 px-3 sm:px-4 flex items-center justify-between border-b border-gray-200 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={openMobileMenu}
            className="p-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
            aria-label="Open navigation menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <Link href="/seller/dashboard" className="flex items-center gap-1.5 sm:gap-2 cursor-pointer min-w-0">
            <Image
              src="/images/ulavan-mart-animated.gif"
              alt="Ulavan Mart"
              width={719}
              height={234}
              unoptimized
              priority
              className="w-[96px] xs:w-[108px] sm:w-[125px] max-h-9 h-auto object-contain shrink-0"
            />
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#174B35] tracking-wider px-1.5 py-0.5 rounded bg-[#E8F0E3] border border-[#729B59]/40 shrink-0">
              SELLER
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-1">
          <HeaderAlertsPopover compact />

          <Link
            href="/seller/profile"
            title="View profile and settings"
            className="w-8 h-8 rounded-full bg-[#E8F0E3] text-[#174B35] font-bold text-xs flex items-center justify-center border border-[#729B59]/30 hover:ring-2 hover:ring-[#174B35]/20 transition-all cursor-pointer shrink-0"
          >
            {profile.avatarInitials || "S"}
          </Link>
        </div>
      </header>

      {/* Persistent Desktop Sidebar / Mobile Drawer */}
      <SellerSidebar
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        sellerName={profile.businessName || "Seller"}
        sellerType={profile.sellerType || "Farmer"}
      />

      {/* Main Page Content - Offset by lg:pl-64 so it never overlaps the fixed sidebar */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 min-h-screen overflow-x-clip">
        <main className="flex-1 p-3 xs:p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function SellerLayout({ children }) {
  return (
    <SellerProvider>
      <SellerLayoutShell>{children}</SellerLayoutShell>
    </SellerProvider>
  );
}

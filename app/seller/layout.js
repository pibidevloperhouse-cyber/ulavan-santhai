"use client";

import React from "react";
import SellerSidebar from "@/components/seller/layout/SellerSidebar";
import { SellerProvider, useSeller } from "@/components/seller/layout/SellerContext";
import { useSessionUser } from "@/services/sessionAuth";
import { getDynamicSellerProfile } from "@/data/sellerPortalData";

function SellerLayoutShell({ children }) {
  const { isMobileMenuOpen, closeMobileMenu, openMobileMenu } = useSeller();
  const sessionUser = useSessionUser();
  const profile = getDynamicSellerProfile(sessionUser);

  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#1F2922]">
      {/* Mobile Top Header - visible only on mobile screens */}
      <div className="lg:hidden bg-[#132E20] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={openMobileMenu}
            className="p-1.5 rounded-lg text-white hover:bg-[#1D4430] transition-colors cursor-pointer"
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
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#24583B] flex items-center justify-center font-bold text-xs text-white">
              U
            </div>
            <span className="font-bold text-sm tracking-tight text-white">
              Ulavan Santhai
            </span>
            <span className="text-[10px] uppercase font-semibold text-[#7E9E81] tracking-wider ml-1">
              SELLER
            </span>
          </div>
        </div>

        <div className="w-7 h-7 rounded-full bg-[#24583B] text-white font-bold text-xs flex items-center justify-center">
          {profile.avatarInitials || "S"}
        </div>
      </div>

      {/* Persistent Desktop Sidebar / Mobile Drawer */}
      <SellerSidebar
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        sellerName={profile.businessName || "Seller"}
        sellerType={profile.sellerType || "Farmer"}
      />

      {/* Main Page Content - Offset by lg:pl-64 so it never overlaps the fixed sidebar */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 min-h-screen">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
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

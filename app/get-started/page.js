"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSessionUser } from "@/services/sessionAuth";
import BrandLogo from "@/components/ui/BrandLogo";

export default function GetStartedPage() {
  const router = useRouter();
  const sessionUser = useSessionUser();

  // 1. Initial status reads from local session (instant render, zero flicker)
  const [liveUser, setLiveUser] = useState(null);

  // 2. Query GET /api/v1/user/me live from Express backend on mount
  useEffect(() => {
    let isMounted = true;

    async function syncLiveStatus() {
      try {
        const token =
          (typeof window !== "undefined" &&
            (sessionStorage.getItem("ulavan_auth_token") ||
              localStorage.getItem("ulavan_auth_token"))) ||
          "";

        if (!token) return;

        const res = await fetch("/api/v1/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
          cache: "no-store",
        });

        if (res.ok) {
          const result = await res.json();
          const userData = result.data || result.user || result;

          if (isMounted && userData && typeof userData === "object") {
            setLiveUser(userData);

            // Sync updated values to session storage for seamless cross-page use
            if (typeof window !== "undefined") {
              const stored = sessionStorage.getItem("ulavan_user");
              const current = stored ? JSON.parse(stored) : {};
              current.sellerOnboarded = Boolean(userData.sellerOnboarded);
              current.buyerOnboarded = Boolean(userData.buyerOnboarded);
              sessionStorage.setItem("ulavan_user", JSON.stringify(current));
            }
          }
        }
      } catch (err) {
        console.warn("[GetStarted] Live status check skipped, using session state:", err.message);
      }
    }

    syncLiveStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const userName =
    liveUser?.name ||
    (sessionUser?.name && sessionUser.name !== "Farmer Ramesh Kumar"
      ? sessionUser.name
      : "");

  // 3. Flags derived with live database priority
  const isSellerOnboarded = liveUser
    ? Boolean(liveUser.sellerOnboarded || liveUser.sellerPaid)
    : Boolean(sessionUser?.sellerOnboarded || sessionUser?.sellerPaid);

  const isBuyerOnboarded = liveUser
    ? Boolean(liveUser.buyerOnboarded || liveUser.buyerPaid)
    : Boolean(sessionUser?.buyerOnboarded || sessionUser?.buyerPaid);

  // 4. Role Selection Redirection Handler
  const handleSelectRole = (role, forceEdit = false) => {
    try {
      const stored =
        sessionStorage.getItem("ulavan_user") ||
        sessionStorage.getItem("ulavan_registered_user") ||
        localStorage.getItem("ulavan_registered_user");
      let currentUser = stored ? JSON.parse(stored) : {};

      const roleCapitalized = role === "buyer" ? "Buyer" : "Seller";
      currentUser.activeRole = role;
      currentUser.role = roleCapitalized;

      sessionStorage.setItem("ulavan_user", JSON.stringify(currentUser));
      sessionStorage.setItem("ulavan_registered_user", JSON.stringify(currentUser));
      localStorage.setItem("ulavan_registered_user", JSON.stringify(currentUser));

      if (role === "seller") {
        if (isSellerOnboarded && !forceEdit) {
          router.push("/seller/dashboard");
        } else {
          router.push("/onboarding?role=seller&step=1");
        }
        return;
      }

      if (role === "buyer") {
        if (isBuyerOnboarded && !forceEdit) {
          router.push("/buyer");
        } else {
          router.push("/onboarding?role=buyer&step=1");
        }
        return;
      }
    } catch {
      router.push(`/onboarding?role=${role}&step=1`);
    }
  };

  const cards = [
    {
      role: "buyer",
      title: "Buyer",
      tagline:
        "For commercial traders, retailers, restaurants, food processors, and wholesale buyers.",
      badge: "Sourcing & Procurement",
      image: "/images/get-started/buyer-wholesale.jpg",
      alt: "Wholesale APMC agriculture mandi with buyers inspecting crates of fresh produce",
      benefits: [
        "Find verified agricultural products.",
        "Discover direct farm producers.",
        "Connect directly with suppliers.",
      ],
      isOnboarded: isBuyerOnboarded,
      popularBadge: isBuyerOnboarded ? "Active Plan" : "Step 1 to 4 Required",
      buttonText: isBuyerOnboarded ? "Explore Marketplace" : "Complete Buyer Form (4 Steps)",
      buttonBg: "bg-[#174B35] hover:bg-[#103A29] text-white",
      borderAccent: "hover:border-[#174B35]",
    },
    {
      role: "seller",
      title: "Seller",
      tagline:
        "For farmers, FPOs, organic producers, plantation growers, and agri-processors.",
      badge: "Producers & Farmers",
      image: "/images/get-started/seller-farmer.jpg",
      alt: "Smiling Indian farmer in paddy field holding freshly harvested crops",
      benefits: [
        "Showcase your agricultural crops & harvest.",
        "Connect directly with bulk verified buyers.",
        "Receive direct farm-gate payments.",
      ],
      isOnboarded: isSellerOnboarded,
      popularBadge: isSellerOnboarded ? "Active Plan" : "Step 1 to 4 Required",
      buttonText: isSellerOnboarded ? "Open Seller Dashboard" : "Complete Seller Form (4 Steps)",
      buttonBg: "bg-[#174B35] hover:bg-[#103A29] text-white",
      borderAccent: "hover:border-[#174B35]",
    },
  ];

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      localStorage.removeItem("ulavan_auth_token");
      localStorage.removeItem("ulavan_registered_user");
    }
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#F5F5EB] flex flex-col font-sans selection:bg-[#174B35] selection:text-white">
      {/* Top Brand Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/90 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
          {/* Animated Brand Logo */}
          <div className="shrink min-w-0 pr-1">
            <BrandLogo width={160} className="w-[110px] sm:w-[160px]" priority />
          </div>

          {/* Quick Links: Home & Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <Link
              href="/"
              className="px-2 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl text-[#174B35] bg-[#E8F0E3] hover:bg-[#d9e8d1] border border-[#729B59]/40 hover:border-[#729B59]/70 transition-all duration-200 cursor-pointer flex items-center gap-1 sm:gap-1.5 shadow-2xs shrink-0 whitespace-nowrap active:scale-95"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#174B35] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl text-[#174B35] bg-[#E8F0E3] hover:bg-[#d9e8d1] border border-[#729B59]/40 hover:border-[#729B59]/70 transition-all duration-200 cursor-pointer flex items-center gap-1 sm:gap-1.5 shadow-2xs shrink-0 whitespace-nowrap active:scale-95"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#174B35] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-16 flex flex-col justify-center">
        {/* Page Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-12">
          <h1
            suppressHydrationWarning
            className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#174B35] tracking-tight leading-tight px-1"
          >
            {userName ? `Welcome back, ${userName}!` : "Welcome to Ulavan Santhai!"}
          </h1>
          <p className="mt-2 sm:mt-3 text-xs sm:text-base lg:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto px-2">
            Switch between your Buyer and Seller workspaces anytime, or complete your tailored profile to start trading with zero middleman margin.
          </p>
          <div className="mt-3.5 sm:mt-5 inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#E8F0E3] text-[#174B35] text-[10px] sm:text-xs font-bold tracking-wide uppercase border border-[#729B59]/30">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#729B59]" />
            <span>Choose Your Marketplace Role</span>
          </div>
        </div>

        {/* 2 Large Image Cards Grid: Buyer and Seller */}
        <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto w-full gap-5 sm:gap-8 items-stretch pb-10 sm:pb-4">
          {cards.map((card) => (
            <div
              key={card.role}
              onClick={() => handleSelectRole(card.role)}
              className={`group bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200/90 sm:border-2 shadow-xs sm:shadow-sm hover:shadow-xl ${card.borderAccent} transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1 relative`}
            >
              {/* Active Plan / Popular Badge (Desktop only on image; moved below photo on mobile so face is never covered) */}
              {card.isOnboarded ? (
                <div className="hidden sm:block absolute sm:top-4 sm:right-4 z-20">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-md tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Verified Plan Active
                  </span>
                </div>
              ) : card.popularBadge ? (
                <div className="hidden sm:block absolute sm:top-4 sm:right-4 z-20">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#174B35] text-white text-[11px] font-bold shadow-md tracking-wide">
                    {card.popularBadge}
                  </span>
                </div>
              ) : null}

              {/* Large Image Header */}
              <div className="relative aspect-[16/10] sm:aspect-[16/11] w-full overflow-hidden bg-gray-100">
                <Image
                  src={card.image}
                  alt={card.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3.5 right-3.5 sm:bottom-3.5 sm:left-4 sm:right-4 text-white">
                  <span className="hidden sm:block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                    {card.badge}
                  </span>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <h3 className="text-2xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
                      {card.title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-4 sm:p-6 lg:p-7 flex-1 flex flex-col justify-between">
                <div>
                  {/* Mobile-Only Status & Role Badge Bar (Neatly placed below photo so image is never obstructed) */}
                  <div className="sm:hidden flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#174B35] bg-[#E8F0E3] px-2.5 py-1 rounded-lg border border-[#729B59]/30">
                      {card.badge}
                    </span>
                    {card.isOnboarded ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-2xs tracking-wide shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Verified Plan Active
                      </span>
                    ) : card.popularBadge ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#174B35] text-white text-[10px] font-bold shadow-2xs tracking-wide shrink-0">
                        {card.popularBadge}
                      </span>
                    ) : null}
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 mb-3.5 sm:mb-5 leading-relaxed min-h-0 sm:min-h-[38px]">
                    {card.tagline}
                  </p>

                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 pt-3 sm:pt-4 border-t border-gray-100">
                    {card.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2 sm:gap-2.5">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#E8F0E3] text-[#174B35] flex items-center justify-center shrink-0 mt-0.5">
                          <svg
                            className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-gray-800 leading-snug">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectRole(card.role);
                    }}
                    className={`w-full py-3 sm:py-3.5 px-4 sm:px-5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 shadow-xs group-hover:shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${card.buttonBg}`}
                  >
                    <span>{card.buttonText}</span>
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

"use client";

import React, { useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Settings, ShieldCheck } from "lucide-react";
import SellerProfileForm from "@/components/seller/profile/SellerProfileForm";
import { useSellerProfileState } from "@/hooks/useSellerProfileState";

function SellerProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");

  useEffect(() => {
    if (requestedTab === "settings") {
      router.replace("/seller/settings");
    }
  }, [requestedTab, router]);

  const {
    profile,
    hasUnsavedChanges,
    isSaving,
    saveNotice,
    saveError,
    handleProfileFieldChange,
    handleToggleCategory,
    handleDocumentUploaded,
    persistUpdates,
    resetChanges,
  } = useSellerProfileState();

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await persistUpdates("profile");
  };

  const displayName =
    profile.businessName && profile.businessName !== "Seller"
      ? profile.businessName
      : profile.accountName || "Seller Profile";

  const roleSummary =
    profile.sellerTypes?.length > 0
      ? profile.sellerTypes.join(" · ")
      : "Registered Seller";

  return (
    <div className="space-y-4">
      {/* Compact Hero Identity Bar */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0B3C26] via-[#135235] to-[#1D6B44] text-white px-4 py-4 sm:px-5 shadow-sm border border-[#1E5C3E]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-[#C5F340] text-[#0B3C26] font-extrabold text-base flex items-center justify-center shrink-0 shadow-xs">
              {profile.avatarInitials || "S"}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white truncate">
                  {displayName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-[10px] font-bold text-[#C5F340] capitalize shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5F340]" />
                  {profile.accountStatus || "Active"}
                </span>
              </div>
              <p className="text-xs text-[#D1E8D7] truncate mt-0.5">
                {roleSummary}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs font-semibold text-[#E8F6EC]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5F340]" />
              <span>{profile.subscription?.price || "₹365 / year"}</span>
            </div>

            <Link
              href="/seller/settings"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#C5F340] hover:bg-[#d3fc59] text-[#0B3C26] text-xs font-extrabold shadow-xs transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Registration & Onboarding Cards */}
      <SellerProfileForm
        profile={profile}
        onFieldChange={handleProfileFieldChange}
        onToggleCategory={handleToggleCategory}
        onDocumentUploaded={handleDocumentUploaded}
        onCancel={resetChanges}
        onSave={handleSaveProfile}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        saveNotice={saveNotice}
        saveError={saveError}
      />
    </div>
  );
}

export default function SellerProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white border border-[#DDE7CE] rounded-2xl p-6 text-xs font-bold text-[#4E6D45]">
          Loading profile...
        </div>
      }
    >
      <SellerProfileContent />
    </Suspense>
  );
}

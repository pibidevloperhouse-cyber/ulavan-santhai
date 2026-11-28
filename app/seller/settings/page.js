"use client";

import React from "react";
import Link from "next/link";
import { Settings, User } from "lucide-react";
import AccountSecurityCard from "@/components/seller/profile/AccountSecurityCard";
import BuyerRoleAndChannelsCard, {
  SettingsFooterBar,
} from "@/components/seller/profile/BuyerRoleAndChannelsCard";
import { useSellerProfileState } from "@/hooks/useSellerProfileState";

export default function SellerSettingsPage() {
  const {
    profile,
    isSaving,
    saveNotice,
    saveError,
    handleProfileFieldChange,
    handleToggleChannel,
    handlePreferenceChange,
    persistUpdates,
    handleLogout,
  } = useSellerProfileState();

  return (
    <div className="space-y-4">
      {/* Compact Settings Hero Bar */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0B3C26] via-[#135235] to-[#1D6B44] text-white px-4 py-4 sm:px-5 shadow-sm border border-[#1E5C3E]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-[#C5F340] text-[#0B3C26] flex items-center justify-center shrink-0 shadow-xs">
              <Settings className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                Settings
              </h1>
              <p className="text-xs text-[#D1E8D7]">
                Password security, buyer access &amp; notifications
              </p>
            </div>
          </div>

          <Link
            href="/seller/profile"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-bold transition-colors self-start sm:self-auto shrink-0"
          >
            <User className="w-3.5 h-3.5 text-[#C5F340]" />
            <span>View profile</span>
          </Link>
        </div>
      </div>

      {/* Equal-Height 2-Column Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <AccountSecurityCard />

        <BuyerRoleAndChannelsCard
          useAsBuyerToo={profile.useAsBuyerToo}
          onToggleBuyerRole={(checked) =>
            handleProfileFieldChange("useAsBuyerToo", checked)
          }
          notificationChannels={profile.notificationChannels}
          onToggleChannel={handleToggleChannel}
          preferences={profile.preferences}
          onPreferenceChange={handlePreferenceChange}
          onSavePreferences={() => persistUpdates("settings")}
          isSavingPreferences={isSaving}
          preferencesNotice={saveNotice}
          preferencesError={saveError}
        />
      </div>

      {/* Compact Bottom Support & Sign Out Strip */}
      <SettingsFooterBar onLogout={handleLogout} />
    </div>
  );
}

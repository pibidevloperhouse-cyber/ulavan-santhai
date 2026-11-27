"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import AccountStatusCard from "@/components/seller/profile/AccountStatusCard";
import SellerProfileForm from "@/components/seller/profile/SellerProfileForm";
import AccountSecurityCard from "@/components/seller/profile/AccountSecurityCard";
import BuyerRoleAndChannelsCard from "@/components/seller/profile/BuyerRoleAndChannelsCard";
import { useSessionUser } from "@/services/sessionAuth";
import { getDynamicSellerProfile } from "@/services/sellerApi";

export default function ProfileAndSettingsPage() {
  const router = useRouter();
  const sessionUser = useSessionUser();
  const baseProfile = useMemo(
    () => getDynamicSellerProfile(sessionUser),
    [sessionUser]
  );
  const [overrides, setOverrides] = useState({});
  const [saveNotice, setSaveNotice] = useState("");

  const profile = useMemo(
    () => ({ ...baseProfile, ...overrides }),
    [baseProfile, overrides]
  );

  const handleProfileFieldChange = (field, val) => {
    setOverrides((prev) => ({ ...prev, [field]: val }));
  };

  const handleToggleCategory = (cat) => {
    const currentCats = profile.categories || [];
    const exists = currentCats.includes(cat);
    const nextCats = exists
      ? currentCats.filter((c) => c !== cat)
      : [...currentCats, cat];
    setOverrides((prev) => ({ ...prev, categories: nextCats }));
  };

  const handleToggleChannel = (channelKey) => {
    setOverrides((prev) => ({
      ...prev,
      notificationChannels: {
        ...profile.notificationChannels,
        [channelKey]: !profile.notificationChannels[channelKey],
      },
    }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem("ulavan_user");
        const existing = raw ? JSON.parse(raw) : {};
        const updated = {
          ...existing,
          name: profile.businessName || existing.name,
          email: profile.email || existing.email,
          mobile: profile.phone.replace(/\D/g, "") || existing.mobile,
          sellerData: {
            ...(existing.sellerData || {}),
            businessName: profile.businessName,
            farmAddress: profile.address,
            village: profile.city,
            pinCode: profile.pinCode,
            farmerCrops: profile.categories,
            sellerType: profile.sellerType,
          },
        };
        sessionStorage.setItem("ulavan_user", JSON.stringify(updated));
        sessionStorage.removeItem("ulavan_registered_user");
        localStorage.removeItem("ulavan_registered_user");
      } catch {
        // ignore
      }
    }
    setSaveNotice("Seller profile updated successfully.");
    setTimeout(() => setSaveNotice(""), 3500);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      localStorage.removeItem("ulavan_auth_token");
    }
    router.push("/login");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0B3C26]">
          Profile and account settings
        </h1>
        <p className="text-xs text-[#4E6D45] mt-0.5">
          Manage your Seller business profile and account preferences
        </p>
      </div>

      {/* Section 1: Account status */}
      <AccountStatusCard
        accountStatus={profile.accountStatus}
        approvedDate={profile.approvedDate}
      />

      {/* Section 2: Seller profile form */}
      <SellerProfileForm
        profile={profile}
        onFieldChange={handleProfileFieldChange}
        onToggleCategory={handleToggleCategory}
        onSave={handleSaveProfile}
        saveNotice={saveNotice}
      />

      {/* Section 3: Account security & Verification */}
      <AccountSecurityCard />

      {/* Section 4: Dual Role & Notification Channels */}
      <BuyerRoleAndChannelsCard
        useAsBuyerToo={profile.useAsBuyerToo}
        onToggleBuyerRole={(checked) =>
          handleProfileFieldChange("useAsBuyerToo", checked)
        }
        notificationChannels={profile.notificationChannels}
        onToggleChannel={handleToggleChannel}
        onLogout={handleLogout}
      />
    </div>
  );
}

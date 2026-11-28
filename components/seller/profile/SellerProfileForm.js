"use client";

import React from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  LockOpen,
  User,
  Store,
  MapPin,
  Mail,
  Phone,
  RotateCcw,
  Save,
} from "lucide-react";
import { TAMIL_NADU_DISTRICTS } from "@/hooks/useSellerProfileState";
import SellerSelect from "../ui/SellerSelect";
import OnboardingClassificationFields from "./OnboardingClassificationFields";
import SellerDocumentsSection from "./SellerDocumentsSection";

const CARD_CLASS =
  "bg-white border border-[#DDE7CE] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 h-full min-w-0";
const INPUT_CLASS =
  "w-full min-w-0 px-3 py-2 bg-[#FCFDF9] border border-[#D2DFC0] rounded-xl text-xs font-medium text-[#0B3C26] placeholder:text-[#7A8C7D] focus:bg-white focus:outline-none focus:border-[#2D8A3E] focus:ring-2 focus:ring-[#C5F340]/50 transition-all";
const ICON_INPUT_CLASS =
  "w-full min-w-0 pl-8 pr-3 py-2 bg-[#FCFDF9] border border-[#D2DFC0] rounded-xl text-xs font-medium text-[#0B3C26] placeholder:text-[#7A8C7D] focus:bg-white focus:outline-none focus:border-[#2D8A3E] focus:ring-2 focus:ring-[#C5F340]/50 transition-all";

export default function SellerProfileForm({
  profile,
  onFieldChange,
  onToggleCategory,
  onDocumentUploaded,
  onCancel,
  onSave,
  isSaving = false,
  hasUnsavedChanges = false,
  saveNotice = "",
  saveError = "",
}) {
  const activeTypes = Array.from(
    new Set(
      [
        ...(Array.isArray(profile.sellerTypes) ? profile.sellerTypes : []),
        ...(profile.sellerType ? [profile.sellerType] : []),
      ].filter(Boolean)
    )
  );

  const savedCrops = Array.isArray(profile.categories) ? profile.categories : [];
  const hasDocSlots =
    activeTypes.length > 0 || Object.keys(profile.documents || {}).length > 0;

  return (
    <form onSubmit={onSave} className="space-y-4 min-w-0">
      {/* Row 1: Account Registration + Seller Onboarding side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        {/* Account Registration */}
        <div className={CARD_CLASS}>
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#E7EEDB]">
            <span className="w-7 h-7 rounded-lg bg-[#ECF9C4] text-[#0B3C26] flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 stroke-[2.2]" />
            </span>
            <h2 className="text-sm font-extrabold text-[#0B3C26]">
              Account registration
            </h2>
          </div>

          <div className="space-y-3">
            <div className="min-w-0">
              <label
                htmlFor="profile-username"
                className="block text-[11px] font-semibold text-[#3C5840] mb-1"
              >
                Username
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-[#54754B] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="profile-username"
                  type="text"
                  value={profile.accountName || ""}
                  onChange={(e) => onFieldChange("accountName", e.target.value)}
                  placeholder="Your registered name"
                  className={ICON_INPUT_CLASS}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="profile-email"
                    className="text-[11px] font-semibold text-[#3C5840]"
                  >
                    Email address
                  </label>
                  {profile.emailVerified && (
                    <span className="text-[10px] font-bold text-[#1D7446] bg-[#EAF5EC] border border-[#BEE3C8] px-1.5 py-0.5 rounded-full">
                      Verified
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#54754B] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="profile-email"
                    type="email"
                    value={profile.email || ""}
                    onChange={(e) => onFieldChange("email", e.target.value)}
                    placeholder="name@example.com"
                    className={ICON_INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="profile-mobile"
                  className="block text-[11px] font-semibold text-[#3C5840] mb-1"
                >
                  Mobile number
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-[#54754B] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="profile-mobile"
                    type="tel"
                    value={profile.phone || ""}
                    onChange={(e) => onFieldChange("phone", e.target.value)}
                    placeholder="+91 9876543210"
                    className={ICON_INPUT_CLASS}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seller Onboarding Details */}
        <div className={CARD_CLASS}>
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#E7EEDB]">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#ECF9C4] text-[#0B3C26] flex items-center justify-center shrink-0">
                <Store className="w-3.5 h-3.5 stroke-[2.2]" />
              </span>
              <h2 className="text-sm font-extrabold text-[#0B3C26]">
                Seller onboarding details
              </h2>
            </div>

            <Link
              href="/seller/subscription"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F5F7EC] hover:bg-[#ECF9C4] border border-[#DDE7CE] text-[11px] font-bold text-[#0B3C26] transition-colors shrink-0"
            >
              <LockOpen className="w-3 h-3 text-[#2D8A3E]" />
              Unlock more
            </Link>
          </div>

          {activeTypes.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {activeTypes.map((typeName) => (
                <span
                  key={typeName}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECF9C4] border border-[#8DC63F]/60 text-[11px] font-extrabold text-[#0B3C26]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2D8A3E]" />
                  {typeName}
                </span>
              ))}
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-semibold text-[#3C5840] mb-1">
                Business / farm name
              </label>
              <input
                type="text"
                value={profile.businessName || ""}
                onChange={(e) => onFieldChange("businessName", e.target.value)}
                placeholder="Name of your farm, business or organisation"
                className={INPUT_CLASS}
              />
            </div>
          )}

          <OnboardingClassificationFields
            profile={profile}
            activeTypes={activeTypes}
            onFieldChange={onFieldChange}
          />

          {savedCrops.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {savedCrops.map((crop) => (
                <button
                  key={crop}
                  type="button"
                  onClick={() => onToggleCategory?.(crop)}
                  title="Click to remove"
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ECF9C4] text-[#0B3C26] border border-[#8DC63F] cursor-pointer hover:bg-[#e1f5aa] transition-colors"
                >
                  ✓ {crop}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Location + Verification Documents */}
      <div
        className={`grid grid-cols-1 gap-4 items-stretch ${
          hasDocSlots ? "lg:grid-cols-12" : ""
        }`}
      >
        <div className={`${hasDocSlots ? "lg:col-span-7" : ""} ${CARD_CLASS}`}>
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#E7EEDB]">
            <span className="w-7 h-7 rounded-lg bg-[#ECF9C4] text-[#0B3C26] flex items-center justify-center shrink-0">
              <MapPin className="w-3.5 h-3.5 stroke-[2.2]" />
            </span>
            <h2 className="text-sm font-extrabold text-[#0B3C26]">
              Location details
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#3C5840] mb-1">
                Street / farm address
              </label>
              <input
                type="text"
                value={profile.farmAddress ?? profile.address ?? ""}
                onChange={(e) => {
                  onFieldChange("farmAddress", e.target.value);
                  onFieldChange("address", e.target.value);
                }}
                placeholder="Survey no., street, village or area"
                className={INPUT_CLASS}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="min-w-0">
                <label className="block text-[11px] font-semibold text-[#3C5840] mb-1">
                  District
                </label>
                <SellerSelect
                  value={profile.district || ""}
                  onChange={(val) => onFieldChange("district", val)}
                  options={TAMIL_NADU_DISTRICTS}
                  placeholder="District"
                  triggerClassName="bg-[#FCFDF9]"
                  ariaLabel="District"
                />
              </div>

              <div className="min-w-0">
                <label className="block text-[11px] font-semibold text-[#3C5840] mb-1">
                  Village / Taluk
                </label>
                <input
                  type="text"
                  value={profile.village || ""}
                  onChange={(e) => onFieldChange("village", e.target.value)}
                  placeholder="e.g. Anaimalai"
                  className={INPUT_CLASS}
                />
              </div>

              <div className="min-w-0">
                <label className="block text-[11px] font-semibold text-[#3C5840] mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={profile.state || "Tamil Nadu"}
                  onChange={(e) => onFieldChange("state", e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>

              <div className="min-w-0">
                <label className="block text-[11px] font-semibold text-[#3C5840] mb-1">
                  PIN code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={profile.pinCode || ""}
                  onChange={(e) =>
                    onFieldChange("pinCode", e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="642001"
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </div>
        </div>

        {hasDocSlots && (
          <div className="lg:col-span-5">
            <SellerDocumentsSection
              documents={profile.documents}
              sellerTypes={activeTypes}
              profile={profile}
              onDocumentUploaded={onDocumentUploaded}
            />
          </div>
        )}
      </div>

      {saveError && (
        <div className="flex items-start gap-2 text-xs text-[#B92C2C] font-semibold bg-[#FDF2F2] border border-[#F8C8C2] px-4 py-2.5 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{saveError}</span>
        </div>
      )}

      {saveNotice && (
        <div className="flex items-start gap-2 text-xs text-[#0B3C26] font-semibold bg-[#ECF9C4] border border-[#C5E37A] px-4 py-2.5 rounded-xl">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#2D8A3E]" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Compact Action Footer */}
      <div className="bg-white border border-[#DDE7CE] rounded-2xl px-4 py-3 shadow-xs flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-between gap-2.5">
        <span className="text-[11px] font-medium text-[#54754B] text-center xs:text-left">
          {hasUnsavedChanges
            ? "Unsaved edits ready to save."
            : "Registration & onboarding details synced."}
        </span>

        <div className="flex flex-col-reverse xs:flex-row items-stretch xs:items-center gap-2">
          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#F5F7EC] text-[#0B3C26] border border-[#DDE7CE] text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-[#C5F340] hover:bg-[#d3fc59] text-[#0B3C26] text-xs font-extrabold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "Save profile"}</span>
          </button>
        </div>
      </div>
    </form>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileCheck2, ShieldCheck } from "lucide-react";
import DocumentUploader from "@/components/forms/DocumentUploader";
import SellerSelect from "../ui/SellerSelect";

export const STANDARD_SELLER_TYPES = [
  "Farmer",
  "Agricultural Producer",
  "Organic Producer",
  "Raw-Material Provider",
  "Ingredient Producer",
  "Manufacturer",
  "Value-Added Manufacturer",
  "Other",
  "Agricultural Products",
  "Organic Products",
  "Agricultural Raw Materials",
  "Agriculture-Derived Ingredients",
  "Value-Added Products",
];

/**
 * Resolves required verification documents for unlocking a Seller classification.
 */
export function getUnlockDocRequirements(
  category,
  { hasFssai = "No", hasGst = "No" } = {}
) {
  if (!category) return [];
  const isCustom = !STANDARD_SELLER_TYPES.includes(category);
  const docs = [];

  if (category === "Farmer" || category === "Agricultural Products") {
    docs.push({
      docType: "LAND_PROOF",
      title: "Patta / Chitta Document",
      description:
        "Upload your official Patta / Chitta document for farm cultivation verification.",
      required: true,
    });
  }

  if (category === "Agricultural Producer") {
    docs.push({
      docType: "FPO_CERTIFICATE",
      title: "FPO / Cooperative Registration Certificate",
      description: "Certificate of Incorporation or Society Registration proof.",
      required: true,
    });
  }

  if (category === "Organic Producer" || category === "Organic Products") {
    docs.push({
      docType: "ORGANIC_CERTIFICATE",
      title: "Organic Certification Document (NPOP / PGS-India)",
      description:
        "Upload valid NPOP scope certificate from an accredited organic certification agency.",
      required: true,
    });
  }

  if (category === "Other" || isCustom) {
    docs.push({
      docType: "ID_PROOF",
      title:
        category === "Other"
          ? "PAN Card / Government Identity Proof"
          : "Identity Proof (Aadhaar Card / Voter ID / PAN)",
      description:
        category === "Other"
          ? "Upload valid Business or Proprietor PAN Card proof."
          : "Government identity proof of the account owner or registered business.",
      required: true,
    });
  }

  if (isCustom) {
    docs.push({
      docType: "BANK_PASSBOOK",
      title: "Bank Account Passbook / Cancelled Cheque",
      description:
        "Required for direct farm-gate settlement with buyers with 0% platform commission.",
      required: true,
    });
  }

  if (
    category === "Manufacturer" ||
    category === "Value-Added Manufacturer" ||
    category === "Value-Added Products" ||
    ((category === "Ingredient Producer" ||
      category === "Agriculture-Derived Ingredients") &&
      hasFssai === "Yes")
  ) {
    docs.push({
      docType: "FSSAI_LICENSE",
      title: "FSSAI Food Safety License Certificate",
      description:
        "Mandatory state or central FSSAI registration certificate for food products.",
      required: true,
    });
  }

  if (
    category === "Raw-Material Provider" ||
    category === "Agricultural Raw Materials" ||
    category === "Ingredient Producer" ||
    category === "Agriculture-Derived Ingredients" ||
    category === "Manufacturer" ||
    category === "Other" ||
    (isCustom && hasGst === "Yes") ||
    (category === "Agricultural Producer" && hasGst === "Yes")
  ) {
    docs.push({
      docType: "GST_CERTIFICATE",
      title: "GST Registration Certificate (Form REG-06)",
      description: "Upload valid GST registration certificate for your business.",
      required: true,
    });
  }

  return docs;
}

export default function UnlockCategoryFlow({
  unlockCategory = "",
  lockedCategoryOptions = [],
  unlockedCategories = [],
  requestedAlreadyUnlocked = false,
  onSelectCategory,
  onClearUnlock,
  uploadedDocs = {},
  onUploadSuccess,
  onRemoveDoc,
  hasFssai = "No",
  onHasFssaiChange,
  hasGst = "No",
  onHasGstChange,
  docRequirements = [],
  areRequiredDocsReady = false,
  unlockResult = null,
}) {
  const isCustomCategory =
    Boolean(unlockCategory) && !STANDARD_SELLER_TYPES.includes(unlockCategory);
  const showFssaiToggle =
    unlockCategory === "Ingredient Producer" ||
    unlockCategory === "Agriculture-Derived Ingredients";
  const showGstToggle =
    unlockCategory === "Agricultural Producer" || isCustomCategory;

  if (unlockResult) {
    return (
      <div className="bg-white border border-[#8DC63F] rounded-2xl p-4 sm:p-6 shadow-2xs space-y-5 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E7EEDB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#ECF9C4] border border-[#C5E37A] flex items-center justify-center text-[#2D8A3E]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#0B3C26]">
                Classification Unlocked &amp; Active
              </h2>
              <p className="text-[11px] text-[#4E6D45]">
                Documents verified and ₹{unlockResult.totalAmount} payment recorded
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#ECF9C4] border border-[#C5E37A] text-[11px] font-bold text-[#0B3C26]">
            {unlockResult.category}
          </span>
        </div>

        <div className="bg-[#F2FAE0] border border-[#C5E37A] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="block text-[11px] text-[#54754B]">
              Unlocked Classification
            </span>
            <span className="font-bold text-[#0B3C26] mt-0.5 block">
              {unlockResult.category}
            </span>
          </div>
          <div>
            <span className="block text-[11px] text-[#54754B]">
              Transaction ID
            </span>
            <span className="font-mono font-bold text-[#0B3C26] mt-0.5 block truncate">
              {unlockResult.transactionId}
            </span>
          </div>
          <div>
            <span className="block text-[11px] text-[#54754B]">
              Invoice &amp; Amount
            </span>
            <span className="font-bold text-[#0B3C26] mt-0.5 block">
              ₹{unlockResult.totalAmount} · {unlockResult.invoiceNumber}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClearUnlock}
            className="px-4 py-2.5 bg-white hover:bg-[#F5F7EC] text-[#0B3C26] border border-[#DDE7CE] text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
          >
            Back to Subscription Overview
          </button>
          <Link
            href={`/seller/products/add?unlocked=${encodeURIComponent(
              unlockResult.category
            )}`}
            className="px-5 py-2.5 bg-[#C5F340] hover:bg-[#d3fc59] text-[#0B3C26] text-xs font-extrabold rounded-xl transition-colors shadow-2xs text-center"
          >
            Continue to Add Product ({unlockResult.category}) &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#DDE7CE] rounded-2xl p-4 sm:p-6 shadow-2xs space-y-5 min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[#E7EEDB]">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-extrabold text-[#0B3C26]">
              Unlock Classification
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#ECF9C4] border border-[#C5E37A] text-[10px] font-bold text-[#0B3C26]">
              Step 1 · Upload Documents
            </span>
          </div>
          <p className="text-xs text-[#4E6D45]">
            Upload the required verification documents below first, then complete the ₹365 payment to unlock{" "}
            <strong className="text-[#0B3C26]">{unlockCategory || "your category"}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/seller/products/add"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DDE7CE] bg-white hover:bg-[#F5F7EC] text-[11px] font-bold text-[#0B3C26] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </Link>
          {onClearUnlock && (
            <button
              type="button"
              onClick={onClearUnlock}
              className="px-3 py-1.5 rounded-xl border border-[#DDE7CE] bg-[#F5F7EC] hover:bg-[#ECF9C4] text-[11px] font-bold text-[#0B3C26] transition-colors cursor-pointer"
            >
              Renew Plan Only
            </button>
          )}
        </div>
      </div>

      {/* Progress Strip */}
      <div className="grid grid-cols-2 gap-2.5">
        <div
          className={`p-3 rounded-xl border flex items-center gap-2.5 ${
            areRequiredDocsReady
              ? "bg-[#F2FAE0] border-[#8DC63F]"
              : "bg-[#ECF9C4] border-[#C5E37A]"
          }`}
        >
          <span
            className={`w-6 h-6 rounded-full text-[11px] font-extrabold flex items-center justify-center shrink-0 ${
              areRequiredDocsReady
                ? "bg-[#2D8A3E] text-white"
                : "bg-[#0B3C26] text-white"
            }`}
          >
            {areRequiredDocsReady ? "✓" : "1"}
          </span>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#0B3C26] truncate">
              Upload Documents
            </div>
            <div className="text-[10px] text-[#4E6D45]">
              {areRequiredDocsReady ? "Ready for payment" : "Required first"}
            </div>
          </div>
        </div>

        <div
          className={`p-3 rounded-xl border flex items-center gap-2.5 ${
            areRequiredDocsReady
              ? "bg-[#ECF9C4] border-[#C5E37A]"
              : "bg-[#F5F7EC] border-[#DDE7CE] opacity-75"
          }`}
        >
          <span
            className={`w-6 h-6 rounded-full text-[11px] font-extrabold flex items-center justify-center shrink-0 ${
              areRequiredDocsReady
                ? "bg-[#0B3C26] text-white"
                : "bg-[#DDE7CE] text-[#54754B]"
            }`}
          >
            2
          </span>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#0B3C26] truncate">
              Pay ₹365 &amp; Unlock
            </div>
            <div className="text-[10px] text-[#4E6D45]">
              {areRequiredDocsReady ? "Enabled on Pay card" : "Locked until docs uploaded"}
            </div>
          </div>
        </div>
      </div>

      {requestedAlreadyUnlocked && (
        <div className="p-3.5 rounded-xl bg-[#F2FAE0] border border-[#C5E37A] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#0B3C26] font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#2D8A3E] shrink-0" />
            <span>
              <strong>{requestedAlreadyUnlocked}</strong> is already unlocked on your Seller account.
            </span>
          </div>
          <Link
            href={`/seller/products/add?unlocked=${encodeURIComponent(
              requestedAlreadyUnlocked
            )}`}
            className="text-xs font-extrabold text-[#2D8A3E] hover:underline"
          >
            Use in Add Product &rarr;
          </Link>
        </div>
      )}

      {/* Classification Selector + Active Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        <div className="min-w-0">
          <label className="block text-xs font-semibold text-[#3C5840] mb-1">
            Category to unlock
          </label>
          {lockedCategoryOptions.length > 0 ? (
            <SellerSelect
              value={unlockCategory}
              onChange={onSelectCategory}
              options={lockedCategoryOptions}
              placeholder="Select a locked category"
              ariaLabel="Category to unlock"
            />
          ) : (
            <div className="px-3 py-2 rounded-xl bg-[#F2FAE0] border border-[#C5E37A] text-xs font-semibold text-[#0B3C26]">
              All active Seller categories are already unlocked.
            </div>
          )}
        </div>

        <div className="min-w-0">
          <span className="block text-xs font-semibold text-[#3C5840] mb-1">
            Already active classifications
          </span>
          {unlockedCategories.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {unlockedCategories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ECF9C4] border border-[#C5E37A] text-[11px] font-bold text-[#0B3C26]"
                >
                  ✓ {cat}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-[#54754B]">
              No active classifications yet. Unlock one below to start listing.
            </span>
          )}
        </div>
      </div>

      {/* Conditional Applicability Radios matching Onboarding rules */}
      {unlockCategory && (showFssaiToggle || showGstToggle) && (
        <div className="p-3.5 rounded-xl bg-[#F5F7EC] border border-[#DDE7CE] space-y-3 text-xs">
          {showFssaiToggle && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-[#0B3C26]">
                Do you have an FSSAI Food License?
              </span>
              <div className="flex items-center gap-4">
                {["Yes", "No"].map((opt) => (
                  <label
                    key={opt}
                    className="inline-flex items-center gap-1.5 cursor-pointer font-semibold text-[#3C5840]"
                  >
                    <input
                      type="radio"
                      name="unlockHasFssai"
                      checked={hasFssai === opt}
                      onChange={() => onHasFssaiChange?.(opt)}
                      className="accent-[#2D8A3E]"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {showGstToggle && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-[#0B3C26]">
                Are you GST Registered?
              </span>
              <div className="flex items-center gap-4">
                {["Yes", "No"].map((opt) => (
                  <label
                    key={opt}
                    className="inline-flex items-center gap-1.5 cursor-pointer font-semibold text-[#3C5840]"
                  >
                    <input
                      type="radio"
                      name="unlockHasGst"
                      checked={hasGst === opt}
                      onChange={() => onHasGstChange?.(opt)}
                      className="accent-[#2D8A3E]"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 1: Required Verification Document Uploaders */}
      {unlockCategory && docRequirements.length > 0 && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#0B3C26]">
              <FileCheck2 className="w-4 h-4 text-[#2D8A3E]" />
              <span>Required Documents for {unlockCategory}</span>
            </div>
            <span className="text-[11px] font-semibold text-[#4E6D45]">
              {docRequirements.filter((d) => uploadedDocs[d.docType]).length} /{" "}
              {docRequirements.length} uploaded
            </span>
          </div>

          <div className="space-y-3">
            {docRequirements.map((reqDoc) => (
              <DocumentUploader
                key={`${unlockCategory}-${reqDoc.docType}`}
                documentType={reqDoc.docType}
                title={reqDoc.title}
                description={reqDoc.description}
                required={reqDoc.required}
                uploadedDoc={uploadedDocs[reqDoc.docType]}
                onUploadSuccess={(doc) => onUploadSuccess?.(reqDoc.docType, doc)}
                onRemove={() => onRemoveDoc?.(reqDoc.docType)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Status Notice before Payment */}
      {unlockCategory && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold ${
            areRequiredDocsReady
              ? "bg-[#F2FAE0] border-[#8DC63F] text-[#0B3C26]"
              : "bg-[#FFF9EE] border-[#FDE0B4] text-[#985F10]"
          }`}
        >
          {areRequiredDocsReady
            ? `✓ Documents uploaded for "${unlockCategory}". Click "Pay ₹365 & Unlock" on the payment card to complete activation.`
            : `Please upload the required document(s) above first. Payment will unlock automatically once verification documents are attached.`}
        </div>
      )}
    </div>
  );
}

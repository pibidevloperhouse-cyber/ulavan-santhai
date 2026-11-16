"use client";

import React from "react";

/**
 * Universal Status Badge adhering to the Ulavan Santhai UI Palette
 */
export default function StatusBadge({ status, className = "" }) {
  if (!status) return null;

  const normalized = String(status).trim().toLowerCase();

  let styles = "bg-[#F1F3F5] text-[#55606E] border-[#DFE3E6]"; // default gray

  if (
    [
      "approved",
      "published",
      "active",
      "available",
      "success",
      "replied",
      "verified",
    ].includes(normalized)
  ) {
    styles = "bg-[#EAF5EC] text-[#1D7446] border-[#BEE3C8]";
  } else if (
    [
      "under review",
      "under_review",
      "pending",
      "pending review",
      "pending payment",
      "limited availability",
      "submitted",
    ].includes(normalized)
  ) {
    styles = "bg-[#FFF6E7] text-[#B06D16] border-[#FDE0B4]";
  } else if (["new"].includes(normalized)) {
    styles = "bg-[#FEF3D6] text-[#A66708] border-[#FBE09E] font-medium";
  } else if (
    [
      "rejected",
      "out of stock",
      "failed",
      "failed payment",
      "suspended",
      "suspended or blocked",
      "expired",
      "expired / unavailable",
    ].includes(normalized)
  ) {
    styles = "bg-[#FDECEC] text-[#C53030] border-[#FAC7C7]";
  } else if (
    [
      "draft",
      "inactive",
      "enquiry",
      "additional info request",
      "interest",
      "contact request",
      "payments",
      "enquiries",
      "listings",
      "subscription",
      "account",
      "orders",
    ].includes(normalized)
  ) {
    styles = "bg-[#F1F3F5] text-[#55606E] border-[#DFE3E6]";
  }

  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles} ${className}`}
    >
      {status}
    </span>
  );
}

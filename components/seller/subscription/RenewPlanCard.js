"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Lock } from "lucide-react";

export default function RenewPlanCard({
  planPrice = "₹365",
  unlockCategory = "",
  docRequirements = [],
  uploadedDocs = {},
  areRequiredDocsReady = false,
  onPay,
  isProcessing = false,
  paymentNotice = "",
  paymentError = "",
  unlockResult = null,
}) {
  const isUnlockFlow = Boolean(unlockCategory);
  const canSubmitUnlockPay = isUnlockFlow
    ? areRequiredDocsReady && !isProcessing && !unlockResult
    : !isProcessing;

  return (
    <div className="bg-white border border-[#DDE7CE] rounded-2xl p-4 sm:p-6 shadow-2xs space-y-5 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E7EEDB]">
        <h2 className="text-sm font-extrabold text-[#0B3C26]">
          {isUnlockFlow ? "Step 2 · Pay & unlock category" : "Renew or buy plan"}
        </h2>
        {isUnlockFlow && (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              areRequiredDocsReady
                ? "bg-[#ECF9C4] border-[#C5E37A] text-[#0B3C26]"
                : "bg-[#F5F7EC] border-[#DDE7CE] text-[#54754B]"
            }`}
          >
            {areRequiredDocsReady ? "Ready to pay" : "Docs required first"}
          </span>
        )}
      </div>

      {/* Plan Radio Option */}
      <div className="border border-[#8DC63F] bg-[#F2FAE0] rounded-xl p-4 flex items-center justify-between gap-2">
        <label className="flex items-center gap-2.5 cursor-pointer min-w-0">
          <input
            type="radio"
            name="plan"
            defaultChecked
            className="accent-[#2D8A3E] text-[#2D8A3E] focus:ring-0 shrink-0"
          />
          <span className="text-xs font-bold text-[#0B3C26] truncate">
            {isUnlockFlow ? `${unlockCategory} · 1 year` : "Seller plan · 1 year"}
          </span>
        </label>
        <span className="text-xs font-extrabold text-[#0B3C26] shrink-0">
          {planPrice}
        </span>
      </div>

      {/* Verification Document Checklist in Unlock Mode */}
      {isUnlockFlow && docRequirements.length > 0 && (
        <div className="bg-[#F5F7EC] border border-[#DDE7CE] rounded-xl p-3.5 space-y-2">
          <div className="text-[11px] font-bold text-[#0B3C26]">
            Verification checklist ({unlockCategory})
          </div>
          <div className="space-y-1.5">
            {docRequirements.map((reqDoc) => {
              const isUploaded = Boolean(uploadedDocs[reqDoc.docType]);
              return (
                <div
                  key={reqDoc.docType}
                  className="flex items-center gap-2 text-xs"
                >
                  {isUploaded ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2D8A3E] shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-[#7A877E] shrink-0" />
                  )}
                  <span
                    className={
                      isUploaded
                        ? "text-[#0B3C26] font-semibold"
                        : "text-[#54754B]"
                    }
                  >
                    {reqDoc.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Breakdown */}
      <div className="space-y-2 text-xs pt-1">
        <div className="flex items-center justify-between text-[#54754B]">
          <span>Subtotal</span>
          <span>{planPrice}</span>
        </div>
        <div className="flex items-center justify-between text-[#0B3C26] font-bold pt-2 border-t border-[#E7EEDB]">
          <span>Total payable</span>
          <span>{planPrice}</span>
        </div>
      </div>

      {paymentError && (
        <div className="text-xs text-[#B92C2C] font-semibold bg-[#FDF2F2] border border-[#F8C8C2] p-2.5 rounded-xl text-center">
          {paymentError}
        </div>
      )}

      {unlockResult ? (
        <Link
          href={`/seller/products/add?unlocked=${encodeURIComponent(
            unlockResult.category
          )}`}
          className="w-full py-2.5 bg-[#C5F340] hover:bg-[#d3fc59] text-[#0B3C26] text-xs font-extrabold rounded-xl transition-colors shadow-2xs text-center block"
        >
          Add Product under {unlockResult.category} &rarr;
        </Link>
      ) : (
        <button
          type="button"
          onClick={onPay}
          disabled={!canSubmitUnlockPay}
          className={`w-full py-2.5 text-xs rounded-xl transition-colors shadow-2xs text-center flex items-center justify-center gap-1.5 ${
            canSubmitUnlockPay
              ? "bg-[#C5F340] hover:bg-[#d3fc59] text-[#0B3C26] font-extrabold cursor-pointer"
              : "bg-[#E7EEDB] text-[#54754B] font-bold cursor-not-allowed opacity-85"
          }`}
        >
          {isUnlockFlow && !areRequiredDocsReady && (
            <Lock className="w-3.5 h-3.5 shrink-0" />
          )}
          <span>
            {isProcessing
              ? "Processing payment..."
              : isUnlockFlow
              ? `Pay ${planPrice} & Unlock`
              : `Pay ${planPrice}`}
          </span>
        </button>
      )}

      {isUnlockFlow && !areRequiredDocsReady && !unlockResult && (
        <p className="text-[11px] text-[#985F10] font-medium bg-[#FFF9EE] border border-[#FDE0B4] rounded-xl p-2.5 text-center">
          Upload the required verification document(s) first to enable the {planPrice} payment button.
        </p>
      )}

      {paymentNotice && (
        <div className="text-xs text-[#0B3C26] font-semibold bg-[#ECF9C4] border border-[#C5E37A] p-2.5 rounded-xl text-center">
          {paymentNotice}
        </div>
      )}

      <p className="text-[11px] text-[#54754B] leading-relaxed">
        You will be taken to the secure payment gateway.{" "}
        {isUnlockFlow
          ? "Your category unlocks immediately after document upload and payment confirmation."
          : "Your subscription activates after payment is confirmed."}
      </p>
    </div>
  );
}

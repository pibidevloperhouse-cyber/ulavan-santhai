"use client";

import React from "react";
import Link from "next/link";

/**
 * Reusable Component: PaymentReceipt
 * Displays the cryptographic tax invoice receipt upon verified Razorpay payment.
 */
export default function PaymentReceipt({
  paymentResult,
  role = "buyer",
  onProceed,
  className = "",
}) {
  if (!paymentResult) return null;

  const isBuyer =
    role === "buyer" ||
    paymentResult.role?.toLowerCase().includes("buyer") ||
    paymentResult.planName?.toLowerCase().includes("buyer");

  const targetUrl = isBuyer ? "/onboarding/status" : "/seller/dashboard";
  const targetLabel = isBuyer
    ? "View Buyer Status & Marketplace"
    : "Go to Seller Dashboard";

  return (
    <div className={`space-y-6 animate-in fade-in ${className}`}>
      {/* Top Success Banner */}
      <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
          <svg
            className="w-8 h-8"
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
        <h2 className="text-2xl font-black text-gray-900">
          Payment Verified &amp; Profile Active!
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
          Your payment of{" "}
          <strong className="text-gray-900">
            ₹{paymentResult.totalAmount || 365}.00
          </strong>{" "}
          has been cryptographically verified via Razorpay. Your verified{" "}
          {isBuyer ? "Buyer" : "Seller"} credentials on UlavanSanthai are now
          active.
        </p>
      </div>

      {/* Official Tax Invoice Details Card */}
      <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50/70 space-y-4 text-xs">
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <div>
            <span className="font-black text-[#1F4D36] text-sm block">
              Ulavan Santhai Agricultural Marketplace
            </span>
            <span className="text-gray-500">
              Official Membership &amp; Access Tax Receipt
            </span>
          </div>
          <div className="text-right">
            <span className="text-gray-400 block font-semibold uppercase text-[10px]">
              Invoice No.
            </span>
            <span className="font-mono font-bold text-gray-900">
              {paymentResult.invoiceNumber}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-white rounded-xl border border-gray-200">
            <span className="text-gray-500 block text-[11px]">Plan Subscribed</span>
            <span className="font-bold text-[#1F4D36]">
              {paymentResult.planName || (isBuyer ? "Buyer Verified Plan" : "Seller Membership")}
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-gray-200">
            <span className="text-gray-500 block text-[11px]">Payment Reference</span>
            <span className="font-mono font-bold text-gray-900 truncate block">
              {paymentResult.transactionId}
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-gray-200 col-span-2 sm:col-span-1">
            <span className="text-gray-500 block text-[11px]">Account Status</span>
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>{" "}
              Verified Active
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-xs text-gray-600">
          <span>Amount Paid (Annual 365 Days)</span>
          <span className="text-sm font-black text-gray-900">
            ₹{paymentResult.totalAmount || 365}.00
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold text-xs transition-colors text-center cursor-pointer"
        >
          Download Tax Receipt PDF
        </button>

        {onProceed ? (
          <button
            type="button"
            onClick={onProceed}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#204732] hover:bg-[#153423] text-white text-xs font-bold shadow-md transition-colors text-center cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{targetLabel}</span>
            <span>&rarr;</span>
          </button>
        ) : (
          <Link
            href={targetUrl}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#204732] hover:bg-[#153423] text-white text-xs font-bold shadow-md transition-colors text-center cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{targetLabel}</span>
            <span>&rarr;</span>
          </Link>
        )}
      </div>
    </div>
  );
}

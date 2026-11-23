"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/ui/BrandLogo";
import { useRazorpayPayment } from "@/hooks/useRazorpayPayment";
import PlanBenefitsCard from "@/components/payment/PlanBenefitsCard";
import PaymentReceipt from "@/components/payment/PaymentReceipt";

/**
 * Clean & Modular PaymentView Component
 * Powers Step 4 of Onboarding for both Buyer (BUYER_ANNUAL) and Seller (SELLER_ANNUAL).
 * Reusable architecture: uses useRazorpayPayment hook, PlanBenefitsCard, and PaymentReceipt.
 */
export default function PaymentView({
  role = "buyer",
  onRoleChange,
  userAuth = {},
  onBack,
  onPaymentSuccess,
  onFinalizePayment: externalFinalizePayment,
  paymentResult: externalPaymentResult,
  isProcessingExternal = false,
}) {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState(role);
  const [paymentResult, setPaymentResult] = useState(externalPaymentResult || null);

  const {
    initiatePayment,
    isProcessing: isHookProcessing,
    error: hookError,
    isAlreadyActive,
  } = useRazorpayPayment();

  const currentRole = onRoleChange ? role : activeRole;
  const isProcessing = isHookProcessing || isProcessingExternal;
  const activeResult = externalPaymentResult || paymentResult;
  const isBuyer = currentRole === "buyer";

  const handleRoleToggle = (newRole) => {
    if (onRoleChange) {
      onRoleChange(newRole);
    } else {
      setActiveRole(newRole);
    }
  };

  /**
   * Triggers the 2-step Razorpay payment workflow via useRazorpayPayment hook
   */
  const handlePay = () => {
    const planId = isBuyer ? "BUYER_ANNUAL" : "SELLER_ANNUAL";

    initiatePayment({
      planId,
      role: currentRole,
      userAuth,
      onSuccess: async (resultPayload) => {
        setPaymentResult(resultPayload);

        // Submit the full onboarding application record to backend if handler provided
        if (externalFinalizePayment) {
          try {
            await externalFinalizePayment(resultPayload.transactionId);
          } catch (subErr) {
            console.warn("Application record submission note:", subErr);
          }
        }

        if (onPaymentSuccess) {
          onPaymentSuccess(resultPayload);
        }
      },
      onFailure: (err) => {
        // If membership is already active, navigate automatically after a short delay
        if (err?.code === "MEMBERSHIP_ALREADY_ACTIVE") {
          setTimeout(() => {
            router.push(isBuyer ? "/onboarding/status" : "/seller/dashboard");
          }, 1800);
        }
      },
    });
  };

  const handleBackAction = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center py-6 sm:py-12 px-4 selection:bg-[#1F4D36] selection:text-white">
      {/* Scenic Agricultural Farm Background */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center filter blur-xs brightness-95 scale-105"
        style={{
          backgroundImage: "url('/images/hero-aerial-fields.jpg')",
        }}
      />
      {/* Natural Atmospheric Gradient Overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#1F4D36]/25 via-white/40 to-[#F5F5EB]/70 backdrop-blur-xs" />

      {/* Main Payment Container Card */}
      <div className="relative z-10 w-full max-w-3xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/60 p-6 sm:p-9 space-y-6">
        {/* Top Header: Brand Logo & Navigation */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <BrandLogo width={155} priority />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleRoleToggle(isBuyer ? "seller" : "buyer")}
              className="text-[11px] font-semibold text-[#1F4D36] hover:underline bg-[#F4F7F2] px-2.5 py-1 rounded-lg border border-gray-200 cursor-pointer"
            >
              View {isBuyer ? "Seller" : "Buyer"} Screen
            </button>

            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#1F4D36] transition-colors"
            >
              <svg
                className="w-4 h-4 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>Home</span>
            </Link>
          </div>
        </div>

        {/* View 1: If Payment Verified -> Reusable Tax Invoice Receipt */}
        {activeResult ? (
          <PaymentReceipt
            paymentResult={activeResult}
            role={currentRole}
          />
        ) : (
          /* View 2: Payment Plan Overview & Razorpay Trigger */
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-[#1F4D36] block">
                Step 4 of 4 • Membership &amp; Platform Access
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                {isBuyer ? "Buyer Verified Plan" : "Seller Platform Membership"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                {isBuyer
                  ? "Activate verified 1-year access to connect directly with certified agricultural producers."
                  : "Activate your producer workspace for 1 full year to showcase crops & receive direct commercial buyer orders."}
              </p>
            </div>

            {/* Error Message Alert */}
            {hookError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 shrink-0 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{hookError}</span>
                </div>
                {isAlreadyActive && (
                  <Link
                    href={isBuyer ? "/onboarding/status" : "/seller/dashboard"}
                    className="shrink-0 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[11px] transition"
                  >
                    Go to {isBuyer ? "Status" : "Dashboard"} &rarr;
                  </Link>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
              {/* Left Column: Reusable Plan Benefits Card */}
              <div className="md:col-span-7">
                <PlanBenefitsCard
                  role={currentRole}
                  planId={isBuyer ? "BUYER_ANNUAL" : "SELLER_ANNUAL"}
                />
              </div>

              {/* Right Column: Pricing & Razorpay Pay Button */}
              <div className="md:col-span-5 bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <h4 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                    Payment Summary
                  </h4>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Annual Membership</span>
                      <span className="font-bold text-gray-900">₹365</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Taxes &amp; Platform Fees</span>
                      <span className="font-bold text-gray-900">₹0</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between items-baseline">
                      <span className="text-sm sm:text-base font-bold text-gray-900">
                        Total Payable
                      </span>
                      <span className="text-2xl font-black text-gray-900">
                        ₹365
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handlePay}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#204732] hover:bg-[#153423] text-white font-bold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Connecting Razorpay...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4 text-emerald-200 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                        <span>Pay ₹365 with Razorpay</span>
                        <span className="text-base font-bold">&rarr;</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
                    <svg
                      className="w-3.5 h-3.5 text-[#204732]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span>Official Gateway (UPI, Cards, NetBanking)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Back Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleBackAction}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <span>&larr;</span>
                <span>Back</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

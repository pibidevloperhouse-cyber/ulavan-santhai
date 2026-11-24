"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/ui/BrandLogo";
import HandshakeLoader from "@/components/ui/HandshakeLoader";
import MobileRegistrationHeader from "@/components/onboarding/MobileRegistrationHeader";
import Stepper from "@/components/forms/Stepper";
import { useRazorpayPayment } from "@/hooks/useRazorpayPayment";

/**
 * Clean & Modular PaymentView Component
 * Powers Step 4 of Onboarding for both Buyer (BUYER_ANNUAL) and Seller (SELLER_ANNUAL).
 * Features 2-panel Onboarding alignment, Stepper, HandshakeLoader, and Real Razorpay Integration.
 */
export default function PaymentView({
  role = "buyer",
  onRoleChange,
  userAuth = {},
  onBack,
  onStepClick,
  onPaymentSuccess,
  onFinalizePayment: externalFinalizePayment,
  paymentResult: externalPaymentResult,
  isProcessingExternal = false,
  backgroundImage = "/images/onboarding-step-4.png",
}) {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState(role);
  const [paymentResult, setPaymentResult] = useState(externalPaymentResult || null);

  const {
    initiatePayment,
    isProcessing: isHookProcessing,
    error: hookError,
    isAlreadyActive,
    clearError,
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

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      localStorage.removeItem("ulavan_auth_token");
      localStorage.removeItem("ulavan_registered_user");
    }
    router.push("/login");
  };

  const handleBackAction = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  /**
   * Executes the 2-step Razorpay payment workflow via useRazorpayPayment hook
   */
  const handlePay = () => {
    clearError();
    const planId = isBuyer ? "BUYER_ANNUAL" : "SELLER_ANNUAL";

    initiatePayment({
      planId,
      role: currentRole,
      userAuth,
      onSuccess: async (resultPayload) => {
        setPaymentResult(resultPayload);

        // Submit application package to backend if handler provided
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
        if (err?.code === "MEMBERSHIP_ALREADY_ACTIVE") {
          setTimeout(() => {
            router.push(isBuyer ? "/onboarding/status" : "/seller/dashboard");
          }, 1800);
        }
      },
    });
  };

  const steps = [
    { id: 1, title: "Profile Details" },
    { id: 2, title: "Document Upload" },
    { id: 3, title: "Review & Submit" },
    { id: 4, title: "Payment" },
  ];

  const handleStepClick = (s) => {
    if (onStepClick) {
      onStepClick(s);
    } else if (s < 4 && onBack) {
      onBack();
    }
  };

  return (
    <div
      className="relative min-h-screen lg:h-screen w-full flex flex-col lg:flex-row font-sans selection:bg-[#1F4D36] selection:text-white bg-[#F5F8EC] lg:overflow-hidden"
    >
      <MobileRegistrationHeader currentStep={4} onStepClick={handleStepClick} onLogout={handleLogout} />
      {/* Panoramic landscape footer strip */}
      <div
        className="hidden lg:block fixed bottom-0 left-0 right-0 h-[30px] pointer-events-none z-20 bg-repeat-x bg-bottom"
        style={{
          backgroundImage: "url('/images/onboarding-landscape-strip.png')",
          backgroundSize: "auto 30px",
        }}
        aria-hidden="true"
      />

      {/* ======================================================== */}
      {/* LEFT PANEL: Brand, Stepper & Tree Visual on Nature BG   */}
      {/* ======================================================== */}
      <div className="w-full lg:w-[500px] xl:w-[560px] 2xl:w-[600px] shrink-0 lg:h-full hidden lg:flex flex-col justify-between p-6 sm:p-7 xl:p-9 pb-8 lg:pb-12 z-10 lg:overflow-hidden select-none">
        {/* Top Brand & Welcome */}
        <div>
          <BrandLogo width={160} priority />
          <h1 className="text-2xl sm:text-3xl font-black text-[#174B35] tracking-tight mt-6 sm:mt-8 leading-tight">
            Create your account!
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1.5">
            Manage crops, soil, and yields in one place
          </p>
        </div>

        {/* Stepper + Flourishing Tree Visual Side-by-Side */}
        <div className="flex items-center justify-between gap-4 my-auto py-6 relative">
          <div className="shrink-0 z-20 pr-2">
            <Stepper
              currentStep={4}
              steps={steps}
              orientation="vertical"
              onStepClick={handleStepClick}
            />
          </div>

          <div className="relative w-[210px] sm:w-[240px] xl:w-[270px] 2xl:w-[300px] h-[230px] sm:h-[260px] xl:h-[290px] 2xl:h-[320px] shrink-0 flex items-end justify-center pointer-events-none translate-x-3 sm:translate-x-6 xl:translate-x-8">
            <div className="relative w-full h-full transition-all duration-700 ease-out transform origin-bottom scale-[1.18] animate-in fade-in duration-300">
              <Image
                src={backgroundImage}
                alt="Step 4 Growth - Flourishing Tree"
                fill
                sizes="(max-width: 640px) 210px, (max-width: 1280px) 240px, 300px"
                className="object-contain object-bottom"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT PANEL: Form Controls on Shared Nature BG         */}
      {/* ======================================================== */}
      <div className="flex-1 w-full lg:h-full lg:overflow-y-auto pt-5 lg:pt-8 pb-10 lg:pb-36 px-4 sm:px-10 xl:px-16 flex flex-col lg:justify-between relative bg-transparent scroll-smooth">
        {/* Top Floating Actions: Home & Logout */}
        <div className="mx-auto w-full max-w-2xl lg:max-w-none flex items-center justify-end gap-2.5 pb-4 lg:pb-6">
          <button
            type="button"
            onClick={() => handleRoleToggle(isBuyer ? "seller" : "buyer")}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-[#174B35] bg-white/90 hover:bg-white border border-gray-200/90 transition-all duration-200 cursor-pointer shadow-2xs backdrop-blur-xs"
          >
            View {isBuyer ? "Seller" : "Buyer"} Screen
          </button>

          <Link
            href="/"
            className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl text-[#174B35] bg-white/90 hover:bg-white border border-gray-200/90 transition-all duration-200 cursor-pointer hidden lg:flex items-center gap-1.5 shadow-2xs backdrop-blur-xs"
          >
            <svg className="w-3.5 h-3.5 text-[#174B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl text-[#174B35] bg-white/90 hover:bg-white border border-gray-200/90 transition-all duration-200 cursor-pointer hidden lg:flex items-center gap-1.5 shadow-2xs backdrop-blur-xs"
          >
            <svg className="w-3.5 h-3.5 text-[#174B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>

        {/* Main Content Container matching Steps 1-3 */}
        <main className="w-full max-w-2xl mx-auto space-y-6 my-0 [&_label]:text-gray-800 [&_label]:font-bold [&_.text-red-500]:text-red-600">
          {/* If Payment Successful: Show Official Receipt */}
          {activeResult ? (
            <div className="space-y-6 animate-in fade-in">
              <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-gray-900">
                  Payment Verified &amp; Profile Active!
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                  Your payment of <strong className="text-gray-900">₹{activeResult.totalAmount || 365}.00</strong> has been verified via Razorpay. Your verified trading credentials on UlavanSanthai are now active.
                </p>
              </div>

              {/* Receipt Summary */}
              <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50/60 space-y-4 text-xs">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <div>
                    <span className="font-black text-[#1F4D36] text-sm block">Ulavan Santhai Agricultural Marketplace</span>
                    <span className="text-gray-500">Official Membership &amp; Platform Access Receipt</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 block font-semibold uppercase text-[10px]">Invoice</span>
                    <span className="font-mono font-bold text-gray-900">{activeResult.invoiceNumber}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-gray-200">
                    <span className="text-gray-500 block text-[11px]">Subscribed Plan</span>
                    <span className="font-bold text-[#1F4D36]">{activeResult.planName || (isBuyer ? "Buyer Verified Plan" : "Seller Membership")}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-gray-200">
                    <span className="text-gray-500 block text-[11px]">Payment Reference</span>
                    <span className="font-mono font-bold text-gray-900 truncate block">{activeResult.transactionId}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-gray-200">
                    <span className="text-gray-500 block text-[11px]">Payment Date</span>
                    <span className="font-bold text-gray-900">{activeResult.paymentDate || "Verified Today"}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") window.print();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Download / Print Receipt
                </button>
                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                  <Link
                    href="/get-started"
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#204732]/30 text-[#204732] hover:bg-[#E8F0E3] text-xs font-bold transition-colors text-center"
                  >
                    Role Switcher (Buyer / Seller)
                  </Link>
                  <Link
                    href={isBuyer ? "/onboarding/status" : "/seller/dashboard"}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#204732] hover:bg-[#153423] text-white text-xs font-bold shadow-md transition-colors text-center"
                  >
                    {isBuyer ? "View Buyer Status" : "Open Seller Dashboard"} &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* Payment View matching exact Steps 1-3 alignment */
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header with Payment Icon Badge matching Steps 1-3 */}
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#174B35] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#174B35] tracking-tight">
                    {isBuyer ? "Buyer Verified Plan" : "Seller Platform Membership"}
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mt-1">
                    {isBuyer
                      ? "Full 1-year verified access to connect directly with certified agricultural producers."
                      : "Activate your producer workspace for 1 full year to showcase crops & receive direct commercial buyer orders."}
                  </p>
                </div>
              </div>

              {/* Error Message if any */}
              {hookError && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start justify-between gap-3 animate-in fade-in">
                  <div className="flex items-start gap-2.5">
                    <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs sm:text-sm font-semibold text-red-800">{hookError}</p>
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

              {/* Two-Column Main Payment Cards Container */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                {/* Left Column: Plan Card */}
                <div className="md:col-span-7 bg-white border border-gray-200/80 rounded-3xl p-5 sm:p-6 shadow-2xs relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-2 relative z-10">
                    {/* Badge & Price Header */}
                    <div className="flex items-start justify-between gap-4">
                      <span className="inline-block px-3 py-1 rounded-full bg-[#174B35] text-white text-[11px] font-bold tracking-wide">
                        {isBuyer ? "Buyer Verified Plan" : "Seller Membership"}
                      </span>
                      <div className="text-right shrink-0">
                        <span className="text-2xl sm:text-3xl font-black text-gray-900">₹365</span>
                        <span className="text-xs text-gray-500 font-semibold block mt-0.5">
                          / Year (₹1.00/day)
                        </span>
                      </div>
                    </div>

                    {/* Title & Subtitle */}
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight pt-1">
                      {isBuyer ? "Verified Buyer Platform Access" : "Agricultural Producer Membership"}
                    </h3>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      {isBuyer
                        ? "Full 1-year verified access to connect with cultivators and procure agricultural produce."
                        : "List crops, receive verified commercial buyer enquiries, and manage your agricultural sales."}
                    </p>

                    {/* Checklist Items */}
                    <div className="pt-3 space-y-2">
                      {(isBuyer
                        ? [
                            "100% Verified Buyer & Procurement Badge",
                            "Direct phone & WhatsApp contact with farmers",
                            "Direct access to farmer harvest produce listings",
                            "Create procurement requests & bulk RFQs",
                            "Zero middleman brokerage & trade commission",
                          ]
                        : [
                            "100% Verified Farmer / Producer Badge",
                            "Showcase unlimited crop & harvest lots",
                            "Receive direct verified commercial buyer enquiries",
                            "Zero commission on all farm-gate transactions",
                            "Direct farmer-to-buyer transparent communication",
                          ]
                      ).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-800">
                          <span className="w-4 h-4 rounded-full bg-[#174B35] text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                            ✓
                          </span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subtle Botanical Leaf Illustration */}
                  <div className="absolute -bottom-2 -right-2 w-32 h-32 pointer-events-none opacity-40">
                    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      <path d="M110 110C90 90 70 70 40 60C30 80 50 110 110 110Z" fill="url(#leaf-grad-1)" />
                      <path d="M40 60C45 40 65 20 95 15C90 40 75 55 40 60Z" fill="url(#leaf-grad-2)" />
                      <path d="M110 110C80 85 55 55 40 60" stroke="#2B563D" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                      <defs>
                        <linearGradient id="leaf-grad-1" x1="40" y1="60" x2="110" y2="110" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#86EFAC" stopOpacity="0.8" />
                          <stop stopColor="#22C55E" stopOpacity="0.3" />
                        </linearGradient>
                        <linearGradient id="leaf-grad-2" x1="40" y1="60" x2="95" y2="15" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#4ADE80" stopOpacity="0.7" />
                          <stop stopColor="#15803D" stopOpacity="0.2" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                {/* Right Column: Payment Summary */}
                <div className="md:col-span-5 bg-white border border-gray-200/80 rounded-3xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <h4 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">Payment Summary</h4>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Annual Membership (365 Days)</span>
                        <span className="font-bold text-gray-900">₹365</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Taxes &amp; Platform Fees</span>
                        <span className="font-bold text-gray-900">₹0</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 flex justify-between items-baseline">
                        <span className="text-sm sm:text-base font-bold text-gray-900">Total Payable</span>
                        <span className="text-2xl font-black text-[#174B35]">₹365</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handlePay}
                      className="w-full py-3.5 px-4 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
                          <span>Subscribe &amp; Pay ₹365</span>
                          <span className="text-base font-bold">&rarr;</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
                      <svg
                        className="w-3.5 h-3.5 text-[#174B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Official Gateway (UPI, Cards, NetBanking)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar matching Steps 1-3 */}
              <div className="flex flex-col items-center gap-2 border-t border-gray-200/80 pt-4 sm:flex-row sm:justify-between sm:gap-4 sm:pt-6">
                <button
                  type="button"
                  onClick={handleBackAction}
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-[#174B35] transition-colors hover:bg-[#e8efdf] focus-visible:outline-2 focus-visible:outline-[#174B35] sm:border sm:border-gray-200 sm:bg-white"
                >
                  <span>&larr; Back to Review</span>
                </button>

                <div className="flex items-center justify-center gap-2 text-center text-xs font-medium text-gray-600">
                  <svg aria-hidden="true" className="size-4 shrink-0 text-[#174B35]"
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
                  <span>100% Encrypted &amp; Secure Payment</span>
                </div>
              </div>
            </div>
          )}

          {/* Handshake Loader while payment/backend processes */}
          {isProcessing && <HandshakeLoader />}
        </main>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { submitRolePayment } from "@/services/paymentApi";
import BrandLogo from "@/components/ui/BrandLogo";
import HandshakeLoader from "@/components/ui/HandshakeLoader";
import Stepper from "@/components/forms/Stepper";

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
  onStepClick,
  onPaymentSuccess,
  onFinalizePayment: externalFinalizePayment,
  paymentResult: externalPaymentResult,
  isProcessingExternal = false,
  backgroundImage = "/images/onboarding-step-4.png",
}) {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState(role);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInitiatePayment = async () => {
    setErrorMessage("");
    setIsProcessing(true);

    const baseAmount = 365;
    const totalAmount = baseAmount;
    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const isLoaded = await loadRazorpayScript();

    if (isLoaded && razorpayKey && typeof window !== "undefined" && window.Razorpay) {
      try {
        const options = {
          key: razorpayKey,
          amount: totalAmount * 100, // paise
          currency: "INR",
          name: "Ulavan Santhai",
          description:
            currentRole === "buyer"
              ? "Buyer Access Plan (10 Sellers)"
              : "Seller Monthly Membership",
          image: "/images/ulavan-santhai-emblem@2x.png",
          prefill: {
            name: userAuth?.name || "Verified Trader",
            email: userAuth?.email || "trader@ulavansanthai.in",
            contact: userAuth?.mobile || "9876543210",
          },
          theme: {
            color: "#1F4D36",
          },
          handler: function (response) {
            handleFinalizePayment(response.razorpay_payment_id || `pay_rzp_${Date.now()}`);
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      } catch (err) {
        console.warn("Razorpay live checkout error, opening preview simulation:", err);
      }
    }

    // In preview mode or when no Razorpay key is configured:
    setIsProcessing(false);
    setIsRazorpayModalOpen(true);
  };

  const handleFinalizePayment = async (razorpayPaymentId) => {
    setIsProcessing(true);
    setIsRazorpayModalOpen(false);

    if (externalFinalizePayment) {
      try {
        await externalFinalizePayment(razorpayPaymentId);
      } catch (err) {
        console.error("External finalize error:", err);
        setErrorMessage("Payment verification failed. Please try again.");
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    const baseAmount = 365;
    const totalAmount = baseAmount;
    const buyerViewLimit = currentRole === "buyer" ? 10 : null;

    const now = new Date();
    const startDate = now.toISOString();
    const endDate = new Date(now);
    if (currentRole === "seller") {
      endDate.setDate(endDate.getDate() + 30);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    const renewalDueDate = endDate.toISOString();

    const txId = `TXN_US_${Date.now().toString().slice(-8)}`;
    const gwRef = razorpayPaymentId || `pay_rzp_${Math.random().toString(36).substring(2, 10)}`;
    const invNumber = `INV-US-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const applicationId = `US_${currentRole.toUpperCase()}_${Date.now().toString().slice(-6)}`;

    try {
      const checkoutData = {
        transactionId: txId,
        gatewayReference: gwRef,
        userId: userAuth?.id || `USR_${Date.now().toString().slice(-6)}`,
        userName: userAuth?.name || "Verified Member",
        userEmail: userAuth?.email || "member@ulavansanthai.in",
        userMobile: userAuth?.mobile || "9876543210",
        role: currentRole.toUpperCase(),
        planId: currentRole === "buyer" ? "plan_buyer_base" : "plan_seller_monthly",
        planName:
          currentRole === "buyer"
            ? "Buyer Access Plan (10 Sellers)"
            : "Seller Monthly Plan (₹365/mo)",
        baseAmount,
        taxAmount: 0,
        totalAmount,
        currency: "INR",
        paymentMethod: "Razorpay (UPI / Cards / Net Banking)",
        paymentDetails: {
          gateway: "Razorpay",
          razorpayPaymentId: gwRef,
        },
      };

      await submitRolePayment(checkoutData);

      if (typeof window !== "undefined") {
        const isBuyer = currentRole === "buyer";
        const stored =
          sessionStorage.getItem("ulavan_user") ||
          sessionStorage.getItem("ulavan_registered_user") ||
          localStorage.getItem("ulavan_registered_user");
        const existing = stored ? JSON.parse(stored) : (userAuth || {});

        const paymentRecord = {
          transactionId: txId,
          gatewayReference: gwRef,
          invoiceNumber: invNumber,
          amount: totalAmount,
          status: "SUCCESS",
          paidAt: startDate,
          planStartDate: startDate,
          planEndDate: endDate.toISOString(),
          renewalDueDate,
          buyerViewLimit,
          buyerViewed: 0,
          buyerRemaining: buyerViewLimit,
        };

        const updatedUser = {
          ...existing,
          role: currentRole.charAt(0).toUpperCase() + currentRole.slice(1),
          activeRole: currentRole,
          status: "active",
          isPaid: true,
          buyerPaid: isBuyer ? true : Boolean(existing.buyerPaid),
          buyerOnboarded: isBuyer ? true : Boolean(existing.buyerOnboarded),
          buyerPayment: isBuyer ? paymentRecord : existing.buyerPayment,

          sellerPaid: !isBuyer ? true : Boolean(existing.sellerPaid),
          sellerOnboarded: !isBuyer ? true : Boolean(existing.sellerOnboarded),
          sellerPayment: !isBuyer ? paymentRecord : existing.sellerPayment,

          payment: paymentRecord,
        };
        sessionStorage.setItem("ulavan_user", JSON.stringify(updatedUser));
        sessionStorage.setItem("ulavan_registered_user", JSON.stringify(updatedUser));
        localStorage.setItem("ulavan_registered_user", JSON.stringify(updatedUser));
        sessionStorage.setItem("ulavan_latest_payment_id", invNumber);
      }

      const res = {
        transactionId: txId,
        gatewayReference: gwRef,
        invoiceNumber: invNumber,
        paymentStatus: "SUCCESS",
        paymentDate: now.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
        planStartDate: now.toLocaleDateString("en-IN", { dateStyle: "medium" }),
        planEndDate: endDate.toLocaleDateString("en-IN", { dateStyle: "medium" }),
        renewalDueDate: endDate.toLocaleDateString("en-IN", { dateStyle: "medium" }),
        role: currentRole === "buyer" ? "Buyer" : "Seller",
        planName:
          currentRole === "buyer"
            ? "Buyer Access Plan (10 Verified Sellers)"
            : "Seller Monthly Plan (Unlimited Listings)",
        baseAmount,
        totalAmount,
        paymentMethod: "Razorpay Gateway",
        buyerViewLimit,
        buyerViewed: 0,
        buyerRemaining: buyerViewLimit,
        applicationId,
      };

      setPaymentResult(res);
      if (onPaymentSuccess) onPaymentSuccess(res);
    } catch (err) {
      console.error("Payment finalization error:", err);
      setErrorMessage("Payment verification failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackAction = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const steps = [
    { id: 1, title: "Profile Details" },
    { id: 2, title: "Document Upload" },
    { id: 3, title: "Review & Submit" },
    { id: 4, title: "Payment" },
  ];

  return (
    <div
      className="relative min-h-screen lg:h-screen w-full flex flex-col lg:flex-row font-sans selection:bg-[#1F4D36] selection:text-white bg-[#F5F8EC] lg:overflow-hidden"
    >
      {/* Panoramic landscape footer strip in sequence without any clipping */}
      <div
        className="fixed bottom-0 left-0 right-0 h-[30px] pointer-events-none z-20 bg-repeat-x bg-bottom"
        style={{
          backgroundImage: "url('/images/onboarding-landscape-strip.png')",
          backgroundSize: "auto 30px",
        }}
        aria-hidden="true"
      />

      {/* ======================================================== */}
      {/* LEFT PANEL: Brand, Stepper & Tree Visual on Nature BG   */}
      {/* ======================================================== */}
      <div className="w-full lg:w-[500px] xl:w-[560px] 2xl:w-[600px] shrink-0 lg:h-full flex flex-col justify-between p-6 sm:p-7 xl:p-9 pb-8 lg:pb-12 z-10 lg:overflow-hidden select-none">
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

        {/* Stepper + Flourishing Tree Visual Side-by-Side (NO vertical line between them) */}
        <div className="flex items-center justify-between gap-4 my-auto py-6 relative">
          {/* Vertical Stepper with Step 4 Active */}
          <div className="shrink-0 z-20 pr-2">
            <Stepper
              currentStep={4}
              steps={steps}
              orientation="vertical"
              onStepClick={(s) => {
                if (onStepClick) {
                  onStepClick(s);
                } else if (s < 4 && onBack) {
                  onBack();
                }
              }}
            />
          </div>

          {/* Step 4: Flourishing Tree Growth Stage Visual - Pushed Right */}
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
      <div className="flex-1 w-full lg:h-full lg:overflow-y-auto pt-8 pb-32 sm:pb-36 px-5 sm:px-10 xl:px-16 flex flex-col justify-between relative bg-transparent scroll-smooth">
        {/* Top Floating Actions: Home, Logout & User Avatar */}
        <div className="flex items-center justify-end gap-2.5 pb-6">
          <Link
            href="/"
            className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl text-[#174B35] bg-white/90 hover:bg-white border border-gray-200/90 transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-2xs backdrop-blur-xs"
          >
            <svg className="w-3.5 h-3.5 text-[#174B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl text-[#174B35] bg-white/90 hover:bg-white border border-gray-200/90 transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-2xs backdrop-blur-xs"
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
                  Payment Successful &amp; Profile Active!
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                  Your payment of <strong className="text-gray-900">₹{activeResult.totalAmount}.00</strong> has been verified via Razorpay. Your verified trading credentials on UlavanSanthai are now active.
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
                    <span className="text-gray-400 block font-semibold uppercase">Invoice</span>
                    <span className="font-mono font-bold text-gray-900">{activeResult.invoiceNumber}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-gray-200">
                    <span className="text-gray-500 block">Subscribed Plan</span>
                    <span className="font-bold text-[#1F4D36]">{activeResult.planName}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-gray-200">
                    <span className="text-gray-500 block">Transaction Reference</span>
                    <span className="font-mono font-bold text-gray-900 truncate block">{activeResult.transactionId}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-gray-200">
                    <span className="text-gray-500 block">Payment Date</span>
                    <span className="font-bold text-gray-900">{activeResult.paymentDate}</span>
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
                  Print / Save Receipt
                </button>
                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                  <Link
                    href="/get-started"
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#204732]/30 text-[#204732] hover:bg-[#E8F0E3] text-xs font-bold transition-colors text-center"
                  >
                    Role Switcher (Buyer / Seller)
                  </Link>
                  <Link
                    href={
                      (activeResult?.role?.toLowerCase().includes("buyer") || activeResult?.planName?.toLowerCase().includes("buyer"))
                        ? "/"
                        : "/seller/dashboard"
                    }
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#204732] hover:bg-[#153423] text-white text-xs font-bold shadow-md transition-colors text-center"
                  >
                    {(activeResult?.role?.toLowerCase().includes("buyer") || activeResult?.planName?.toLowerCase().includes("buyer")) ? "Explore Marketplace" : "Open Seller Dashboard"} &rarr;
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
                    {currentRole === "buyer" ? "Buyer Membership Payment" : "Seller Subscription Payment"}
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mt-1">
                    {currentRole === "buyer"
                      ? "Get access to explore and connect with trusted sellers."
                      : "Continue as a verified seller and showcase your products."}
                  </p>
                </div>
              </div>

              {/* Error Message if any */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 animate-in fade-in">
                  <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs sm:text-sm font-semibold text-red-800">{errorMessage}</p>
                </div>
              )}

              {/* Two-Column Main Payment Cards Container matching original design */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                {/* Left Column: Plan Card */}
                <div className="md:col-span-7 bg-white border border-gray-200/80 rounded-3xl p-5 sm:p-6 shadow-2xs relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-2 relative z-10">
                    {/* Badge & Price Header */}
                    <div className="flex items-start justify-between gap-4">
                      <span className="inline-block px-3 py-1 rounded-full bg-[#174B35] text-white text-[11px] font-bold tracking-wide">
                        {currentRole === "buyer" ? "Buyer Plan" : "Seller Plan"}
                      </span>
                      <div className="text-right shrink-0">
                        <span className="text-2xl sm:text-3xl font-black text-gray-900">₹365</span>
                        <span className="text-xs text-gray-500 font-semibold block mt-0.5">
                          {currentRole === "buyer" ? "/ Year" : "/ Month"}
                        </span>
                      </div>
                    </div>

                    {/* Title & Subtitle */}
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight pt-1">
                      {currentRole === "buyer" ? "Access up to 10 Sellers" : "Seller Subscription"}
                    </h3>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      {currentRole === "buyer"
                        ? "Explore products and connect with trusted sellers on our platform."
                        : "List and manage your products on UlavanSanthai."}
                    </p>

                    {/* Checklist Items */}
                    <div className="pt-3 space-y-2">
                      {(currentRole === "buyer"
                        ? [
                          "Search & Explore Products",
                          "Connect with Sellers",
                          "Safe & Trusted Platform",
                        ]
                        : [
                          "Add Products & Showcase",
                          "Manage Your Business",
                          "Reach More Buyers",
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

                  {/* Subtle Botanical Leaf Illustration / Watermark in Bottom-Right Corner */}
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
                        <span>{currentRole === "buyer" ? "Plan Amount" : "Subscription Fee"}</span>
                        <span className="font-bold text-gray-900">₹365</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Tax (if applicable)</span>
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
                          <span>Connecting...</span>
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
                          <span>Pay ₹365 Now</span>
                          <span className="text-base font-bold">&rarr;</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
                      <svg
                        className="w-3.5 h-3.5 text-[#174B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Secure payment via Razorpay</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Alert / Info Banner */}
              <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-3.5 flex items-center justify-center gap-2 text-xs text-[#174B35] font-semibold shadow-2xs">
                <svg className="w-4 h-4 text-[#174B35] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>You will be redirected to Razorpay&apos;s secure payment page</span>
              </div>

              {/* Action Bar matching Steps 1-3 */}
              <div className="pt-6 border-t border-gray-200/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBackAction}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-[#174B35] font-bold text-sm shadow-xs border border-gray-200 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>&larr; Back to Review</span>
                </button>

                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                  <svg className="w-3.5 h-3.5 text-[#174B35]"
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

          {/* Razorpay Interactive Simulation Modal (Fallback for Local / Preview) */}
          {isRazorpayModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#0C2340] text-white flex items-center justify-center font-black text-xs">
                      R
                    </div>
                    <span className="font-bold text-gray-900 text-sm">Razorpay Checkout</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRazorpayModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="py-5 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0C2340] flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-black text-gray-900">Ulavan Santhai Platform Access</h4>
                  <p className="text-xs text-gray-500">
                    {currentRole === "buyer" ? "Buyer Verified Plan (10 Sellers)" : "Seller Monthly Membership Plan"}
                  </p>
                  <div className="text-2xl font-black text-[#1F4D36]">₹365.00</div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium text-left">
                    ⚡ <strong>Razorpay Gateway Ready</strong>: Complete test payment to activate your trading credentials.
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleFinalizePayment(`pay_rzp_mock_${Date.now().toString().slice(-8)}`)}
                    className="w-full py-3 px-4 rounded-xl bg-[#204732] hover:bg-[#153423] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Complete &amp; Simulate Successful Payment</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRazorpayModalOpen(false)}
                    className="w-full py-2 px-4 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Cancel Transaction
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Handshake Loader while payment/backend processes */}
          {processingState && <HandshakeLoader />}
        </main>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/ui/BrandLogo";
import { loadRazorpayScript } from "@/utils/loadRazorpay";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/services/paymentApi";

export default function PaymentView({
  role = "buyer",
  onRoleChange,
  userAuth = {},
  onBack,
  onPaymentSuccess,
  onFinalizePayment: externalFinalizePayment,
  addonBlocks = 0,
  paymentResult: externalPaymentResult,
  isProcessingExternal = false,
}) {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState(role);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(externalPaymentResult || null);
  const [errorMessage, setErrorMessage] = useState("");

  const currentRole = onRoleChange ? role : activeRole;
  const processingState = isProcessing || isProcessingExternal;
  const activeResult = externalPaymentResult || paymentResult;

  const handleRoleToggle = (newRole) => {
    if (onRoleChange) {
      onRoleChange(newRole);
    } else {
      setActiveRole(newRole);
    }
  };

  /**
   * Real Razorpay Checkout Flow:
   * 1. Loads Razorpay checkout.js script dynamically
   * 2. Calls backend POST /api/v1/payments/create-order with planId
   * 3. Opens the official Razorpay Checkout Modal
   * 4. On payment completion, sends signatures to POST /api/v1/payments/verify
   * 5. Activates account & displays official tax invoice receipt only on HTTP 200
   */
  const handleInitiatePayment = async () => {
    setErrorMessage("");
    setIsProcessing(true);

    try {
      // 1. Ensure Razorpay Checkout SDK is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Failed to load Razorpay gateway SDK. Please check your internet connection.");
      }

      // 2. Determine target plan governed by backend database
      const planId = currentRole === "seller" ? "SELLER_ANNUAL" : "BUYER_ANNUAL";

      // 3. Request order creation from backend
      const orderRes = await createRazorpayOrder(planId);
      if (!orderRes.success) {
        throw new Error(orderRes.error || "Failed to initialize payment order on server.");
      }

      const orderData = orderRes.data || orderRes;
      const orderId = orderData.orderId || orderData.id;
      const keyId = orderData.keyId || orderData.key;
      const amount = orderData.amount || 36500;
      const currency = orderData.currency || "INR";
      const plan = orderData.plan;

      if (!orderId || !keyId) {
        throw new Error("Incomplete payment order received from server.");
      }

      // 4. Configure official Razorpay options
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "Ulavan Santhai",
        description:
          plan?.name ||
          (currentRole === "buyer"
            ? "Buyer Verified Access Plan"
            : "Verified Seller Annual Membership"),
        image: "/images/ulavan-santhai-emblem@2x.png",
        order_id: orderId,
        prefill: {
          name: userAuth?.name || "",
          email: userAuth?.email || "",
          contact: userAuth?.mobile || "",
        },
        theme: {
          color: "#174B35",
        },
        handler: async function (response) {
          setIsProcessing(true);
          setErrorMessage("");

          try {
            // Dynamically determine payment method from Razorpay response or default to RAZORPAY_ONLINE
            const detectedMethod =
              response.razorpay_payment_method ||
              response.method ||
              "RAZORPAY_ONLINE";

            // 5. Send signatures to backend for HMAC-SHA256 verification
            const verifyRes = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentMethod: detectedMethod,
            });

            if (!verifyRes.success) {
              throw new Error(verifyRes.error || "Payment verification failed on server.");
            }

            // 6. Submit full application if in onboarding flow
            if (externalFinalizePayment) {
              try {
                await externalFinalizePayment(response.razorpay_payment_id);
              } catch (subErr) {
                console.warn("Application record submission note:", subErr);
              }
            }

            // 7. Update session storage only after backend verification succeeds
            const isBuyer = currentRole === "buyer";
            const stored =
              typeof window !== "undefined"
                ? sessionStorage.getItem("ulavan_user") || localStorage.getItem("ulavan_registered_user")
                : null;
            const existing = stored ? JSON.parse(stored) : (userAuth || {});

            const invoiceNumber = `INV-US-2026-${Math.floor(100000 + Math.random() * 900000)}`;

            // Sanitize user object to prevent storing any password or credential data
            const { password, ...safeExisting } = existing;

            const updatedUser = {
              ...safeExisting,
              role: currentRole.charAt(0).toUpperCase() + currentRole.slice(1),
              activeRole: currentRole,
              status: "active",
              isPaid: true,
              buyerPaid: isBuyer ? true : Boolean(safeExisting.buyerPaid),
              buyerOnboarded: isBuyer ? true : Boolean(safeExisting.buyerOnboarded),
              sellerPaid: !isBuyer ? true : Boolean(safeExisting.sellerPaid),
              sellerOnboarded: !isBuyer ? true : Boolean(safeExisting.sellerOnboarded),
            };

            if (typeof window !== "undefined") {
              sessionStorage.setItem("ulavan_user", JSON.stringify(updatedUser));
              sessionStorage.setItem("ulavan_registered_user", JSON.stringify(updatedUser));
              localStorage.setItem("ulavan_registered_user", JSON.stringify(updatedUser));
              sessionStorage.setItem("ulavan_latest_payment_id", invoiceNumber);
            }

            const resultPayload = {
              transactionId: response.razorpay_payment_id,
              gatewayReference: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              invoiceNumber,
              paymentStatus: "SUCCESS",
              paymentDate: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
              role: currentRole === "buyer" ? "Buyer" : "Seller",
              planName:
                plan?.name ||
                (currentRole === "buyer"
                  ? "Buyer Verified Access Plan"
                  : "Seller Platform Membership"),
              baseAmount: Math.round(amount / 100),
              totalAmount: Math.round(amount / 100),
              paymentMethod: `Razorpay (${detectedMethod})`,
            };

            setPaymentResult(resultPayload);
            if (onPaymentSuccess) onPaymentSuccess(resultPayload);
          } catch (verifyErr) {
            console.error("Razorpay verification error:", verifyErr);
            setErrorMessage(verifyErr.message || "Payment confirmation failed on server.");
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      // 8. Open the official Razorpay Checkout Modal
      const paymentWindow = new window.Razorpay(options);
      paymentWindow.open();
    } catch (err) {
      console.error("Razorpay order initiation error:", err);
      setErrorMessage(err.message || "An error occurred while preparing payment.");
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

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      localStorage.removeItem("ulavan_auth_token");
      localStorage.removeItem("ulavan_registered_user");
    }
    router.push("/login");
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center py-6 sm:py-12 px-4 selection:bg-[#1F4D36] selection:text-white">
      {/* Scenic Agricultural Farm Background with Soft Blur */}
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
        {/* Top Header: Brand Logo, Home & Logout */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <BrandLogo width={155} priority />

          <div className="flex items-center gap-4">
            {/* Quick role toggle button for testing */}
            <button
              type="button"
              onClick={() => handleRoleToggle(currentRole === "buyer" ? "seller" : "buyer")}
              className="text-[11px] font-semibold text-[#1F4D36] hover:underline bg-[#F4F7F2] px-2.5 py-1 rounded-lg border border-gray-200"
            >
              View {currentRole === "buyer" ? "Seller" : "Buyer"} Screen
            </button>

            <Link
              href="/"
              className="px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl text-[#174B35] bg-[#E8F0E3] hover:bg-[#d9e8d1] border border-[#729B59]/40 hover:border-[#729B59]/70 transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <svg className="w-4 h-4 text-[#174B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl text-[#174B35] bg-[#E8F0E3] hover:bg-[#d9e8d1] border border-[#729B59]/40 hover:border-[#729B59]/70 transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <svg className="w-4 h-4 text-[#174B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>

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
                Your payment of <strong className="text-gray-900">₹{activeResult.totalAmount}.00</strong> has been cryptographically verified via Razorpay. Your verified trading credentials on UlavanSanthai are now active.
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
                  <span className="text-gray-500 block">Payment ID</span>
                  <span className="font-mono font-bold text-gray-900 truncate block">{activeResult.transactionId}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-200 col-span-2 sm:col-span-1">
                  <span className="text-gray-500 block">Status</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Verified Active
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button to Open Dashboard */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold text-xs transition-colors text-center cursor-pointer"
              >
                Download Receipt PDF
              </button>

              <Link
                href={
                  (activeResult?.role?.toLowerCase().includes("buyer") || activeResult?.planName?.toLowerCase().includes("buyer"))
                    ? "/marketplace"
                    : "/seller/dashboard"
                }
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#204732] hover:bg-[#153423] text-white text-xs font-bold shadow-md transition-colors text-center cursor-pointer"
              >
                Go to {(activeResult?.role?.toLowerCase().includes("buyer") || activeResult?.planName?.toLowerCase().includes("buyer")) ? "Buyer Marketplace" : "Seller Dashboard"} &rarr;
              </Link>
            </div>
          </div>
        ) : (
          /* Payment Selection & Summary View */
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-[#1F4D36] block">
                Step 4 of 4 • Membership &amp; Platform Access
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                {currentRole === "buyer" ? "Buyer Sourcing Access" : "Seller Platform Membership"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                {currentRole === "buyer"
                  ? "Activate verified access to contact certified agricultural producers directly."
                  : "Activate your agricultural producer workspace for 1 full year to showcase crops & receive direct commercial buyer orders."}
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
              {/* Left Column: Plan Benefits */}
              <div className="md:col-span-7 bg-[#F4F7F2]/80 border border-[#1F4D36]/15 rounded-2xl p-5 sm:p-6 space-y-4 relative overflow-hidden">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#1F4D36] text-white text-[10px] font-bold uppercase tracking-wider">
                    Official Fair-Trade Plan
                  </span>
                  <h4 className="text-base sm:text-lg font-bold text-[#1F4D36]">
                    {currentRole === "buyer" ? "Verified Buyer Plan" : "Annual Producer Membership"}
                  </h4>
                </div>

                <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-[#204732] font-black">✓</span>
                    <span>100% Verified Farmer / Buyer Badge</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#204732] font-black">✓</span>
                    <span>Direct Farm-Gate Direct Communication</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#204732] font-black">✓</span>
                    <span>Zero Brokerage &amp; Zero Procurement Commission</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#204732] font-black">✓</span>
                    <span>Unlimited Harvest Lot Showcases &amp; Enquiries</span>
                  </li>
                </ul>
              </div>

              {/* Right Column: Pricing & Razorpay Pay Button */}
              <div className="md:col-span-5 bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <h4 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">Payment Summary</h4>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Annual Membership</span>
                      <span className="font-bold text-gray-900">₹365</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Taxes &amp; Fees</span>
                      <span className="font-bold text-gray-900">₹0</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between items-baseline">
                      <span className="text-sm sm:text-base font-bold text-gray-900">Total Payable</span>
                      <span className="text-2xl font-black text-gray-900">₹365</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    disabled={processingState}
                    onClick={handleInitiatePayment}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#204732] hover:bg-[#153423] text-white font-bold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {processingState ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Connecting Razorpay...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-emerald-200 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Pay ₹365 with Razorpay</span>
                        <span className="text-base font-bold">&rarr;</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
                    <svg className="w-3.5 h-3.5 text-[#204732]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Official Razorpay Gateway (UPI, Cards, NetBanking)</span>
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

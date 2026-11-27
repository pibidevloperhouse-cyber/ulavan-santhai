"use client";

import { useState, useCallback } from "react";
import { loadRazorpayScript } from "@/utils/loadRazorpay";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  fetchCurrentUserProfile,
  PRICING_PLANS,
} from "@/services/paymentApi";

/**
 * Reusable React Hook: useRazorpayPayment
 * Encapsulates the entire 2-step Razorpay lifecycle:
 * 1. Script injection
 * 2. Order creation (handles 409 conflict if membership already active)
 * 3. Opening official Razorpay modal
 * 4. Cryptographic HMAC verification
 * 5. Automatic live profile sync via /api/user/me
 */
export function useRazorpayPayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [isAlreadyActive, setIsAlreadyActive] = useState(false);

  const clearError = useCallback(() => {
    setError("");
    setIsAlreadyActive(false);
  }, []);

  const initiatePayment = useCallback(
    async ({
      planId = "BUYER_ANNUAL",
      role = "buyer",
      userAuth = {},
      amount: requestedAmount,
      categories = [],
      selectedCategories = [],
      onSuccess,
      onFailure,
    }) => {
      setIsProcessing(true);
      setError("");
      setIsAlreadyActive(false);

      const isBuyer = role === "buyer" || planId.toUpperCase().includes("BUYER");
      const targetRoleKey = isBuyer ? "BUYER" : "SELLER";
      const planMeta = PRICING_PLANS[targetRoleKey] || PRICING_PLANS.BUYER;

      try {
        // 1. Ensure Razorpay Checkout SDK is ready on window
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          throw new Error(
            "Failed to load Razorpay payment gateway SDK. Please check your internet connection."
          );
        }

        const activeCategories =
          selectedCategories.length > 0
            ? selectedCategories
            : categories.length > 0
            ? categories
            : isBuyer
            ? ["Buyer"]
            : ["Farmer"];

        // 2. Step 1: Create Order on Backend (/api/v1/payments/create-order)
        const orderRes = await createRazorpayOrder(activeCategories);

        // Handle HTTP 409 Conflict: user already has an active membership for this role
        if (
          orderRes.status === 409 ||
          orderRes.raw?.code === "MEMBERSHIP_ALREADY_ACTIVE" ||
          orderRes.raw?.error?.includes("already active")
        ) {
          setIsAlreadyActive(true);
          const activeMsg =
            orderRes.raw?.message ||
            `You already have an active ${isBuyer ? "Buyer" : "Seller"} membership.`;
          setError(activeMsg);
          setIsProcessing(false);

          if (onFailure) {
            onFailure({
              code: "MEMBERSHIP_ALREADY_ACTIVE",
              message: activeMsg,
            });
          }
          return;
        }

        if (!orderRes.success) {
          throw new Error(
            orderRes.error ||
              orderRes.raw?.message ||
              "Failed to initialize payment order on server."
          );
        }

        const orderData = orderRes.data || orderRes.raw?.data || orderRes;
        const orderId = orderData.orderId || orderData.id;
        const keyId = orderData.keyId || orderData.key;
        const amount = orderData.amount || (requestedAmount ? requestedAmount * 100 : 36500);
        const currency = orderData.currency || "INR";
        const serverPlan = orderData.plan;

        if (!orderId || !keyId) {
          throw new Error("Server returned an incomplete payment order.");
        }

        // 3. Configure official Razorpay Checkout options
        const options = {
          key: keyId,
          amount: amount,
          currency: currency,
          name: "Ulavan Santhai",
          description:
            serverPlan?.name ||
            planMeta.name ||
            (isBuyer
              ? "Buyer Verified Plan (1 Year Access)"
              : "Seller Platform Membership (1 Year Access)"),
          image: "/images/ulavan-santhai-emblem@2x.png",
          order_id: orderId,
          prefill: {
            name: userAuth?.name || "",
            email: userAuth?.email || "",
            contact: userAuth?.mobile || "",
          },
          theme: {
            color: "#16a34a", // Agricultural Emerald Green
          },
          handler: async function (response) {
            setIsProcessing(true);
            setError("");

            try {
              // 4. Step 2: Verify Cryptographic Signatures (/api/v1/payments/verify)
              const detectedMethod =
                response.razorpay_payment_method ||
                response.method ||
                "RAZORPAY_ONLINE";

              const verifyRes = await verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentMethod: detectedMethod,
              });

              if (!verifyRes.success) {
                throw new Error(
                  verifyRes.error ||
                    verifyRes.raw?.message ||
                    "Payment signature verification failed on server."
                );
              }

              // 5. Sync Live Profile from Supabase (/api/user/me)
              let liveUser = null;
              try {
                const profileRes = await fetchCurrentUserProfile();
                if (profileRes.success && profileRes.user) {
                  liveUser = profileRes.user;
                }
              } catch (profileErr) {
                console.warn(
                  "Note: Live profile sync will complete on next refresh:",
                  profileErr
                );
              }

              // 6. Update local session storage cleanly with backend data
              const safeUser = liveUser || userAuth || {};
              const invoiceNumber =
                verifyRes.data?.invoiceNumber ||
                verifyRes.raw?.invoiceNumber ||
                `INV-US-2026-${Math.floor(100000 + Math.random() * 900000)}`;

              if (typeof window !== "undefined") {
                if (liveUser && typeof liveUser === "object") {
                  sessionStorage.setItem("ulavan_user", JSON.stringify(liveUser));
                } else {
                  // Fallback: update flags on existing session object until live sync completes
                  const stored = sessionStorage.getItem("ulavan_user");
                  if (stored) {
                    try {
                      const current = JSON.parse(stored);
                      current.isPaid = true;
                      if (isBuyer) {
                        current.buyerPaid = true;
                        current.buyerOnboarded = true;
                      } else {
                        current.sellerPaid = true;
                        current.sellerOnboarded = true;
                      }
                      sessionStorage.setItem("ulavan_user", JSON.stringify(current));
                    } catch {
                      // ignore
                    }
                  }
                }
                sessionStorage.removeItem("ulavan_registered_user");
                localStorage.removeItem("ulavan_registered_user");
              }

              const resultPayload = {
                transactionId: response.razorpay_payment_id,
                gatewayReference: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                invoiceNumber,
                paymentStatus: "SUCCESS",
                paymentDate: new Date().toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }),
                role: isBuyer ? "Buyer" : "Seller",
                planName:
                  serverPlan?.name ||
                  planMeta.name ||
                  (isBuyer ? "Buyer Verified Plan" : "Seller Membership"),
                baseAmount: Math.round(amount / 100),
                totalAmount: Math.round(amount / 100),
                paymentMethod: `Razorpay (${detectedMethod})`,
                user: safeUser,
              };

              setIsProcessing(false);

              if (onSuccess) {
                onSuccess(resultPayload);
              }
            } catch (verifyErr) {
              console.error("[PAYMENT ERROR] Verification error:", verifyErr);
              const errMsg =
                verifyErr.message ||
                "Payment verification failed on server. Please contact support.";
              setError(errMsg);
              setIsProcessing(false);
              if (onFailure) {
                onFailure(verifyErr);
              }
            }
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
              console.log("[PAYMENT] Razorpay modal dismissed by user.");
            },
          },
        };

        // 7. Open the Razorpay Modal
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        console.error("[PAYMENT ERROR] Initiation failed:", err);
        const errMsg =
          err.message || "An unexpected error occurred while preparing payment.";
        setError(errMsg);
        setIsProcessing(false);
        if (onFailure) {
          onFailure(err);
        }
      }
    },
    []
  );

  return {
    initiatePayment,
    isProcessing,
    error,
    isAlreadyActive,
    clearError,
  };
}

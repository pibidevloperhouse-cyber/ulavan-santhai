/**
 * Ulavan Santhai - Payment API Service
 * Strictly communicates with backend API (/api/v1/payments).
 * Implements real 2-step Razorpay Order Creation and Cryptographic Verification.
 * No mock data, no static dummy fallback arrays.
 */

import { apiFetch } from "./apiConfig";

/**
 * Configurable Role-Based Pricing Plans (metadata for UI display)
 * Note: Actual transaction amounts are strictly governed by backend database.
 */
export const PRICING_PLANS = {
  BUYER: {
    id: "BUYER_ANNUAL",
    legacyId: "plan_buyer_base",
    role: "BUYER",
    name: "Buyer Verified Access Plan",
    basePrice: 365,
    taxAmount: 0,
    totalAmount: 365,
    currency: "INR",
    billingCycle: "Annual Access",
    initialContactLimit: 10,
    topUpRate: 10,
    topUpBlock: 10,
    description: "Unlock up to 10 verified agricultural producers with direct contact details. Additional unlocks at ₹10 for 10 producers.",
    benefits: [
      "View up to 10 verified farmer/seller contacts",
      "Direct call and WhatsApp access to cultivators",
      "Send unlimited direct purchase enquiries",
      "Zero middleman brokerage or procurement commission",
      "Top-up anytime at ₹10 per 10 additional producers",
    ],
  },
  SELLER: {
    id: "SELLER_ANNUAL",
    legacyId: "plan_seller_monthly",
    role: "SELLER",
    name: "Seller Platform Membership",
    basePrice: 365,
    taxAmount: 0,
    totalAmount: 365,
    currency: "INR",
    billingCycle: "Annual Access",
    renewalPeriodDays: 365,
    description: "Showcase agricultural harvest lots, receive verified commercial buyer enquiries, and access fair-trade market tools.",
    benefits: [
      "List and showcase unlimited agricultural crop lots",
      "Prominent verified producer listing badge",
      "Receive direct buyer enquiries and request for quotes",
      "Zero commission on all farm-gate transactions",
      "Direct farmer-to-buyer transparent communication",
    ],
  },
};

/**
 * Step 1: Create payment order on backend
 * Calls POST /api/v1/payments/create-order with { planId }
 * Backend fetches price from database, creates Razorpay order, returns { orderId, amount, currency, keyId, plan }
 */
export async function createRazorpayOrder(planId) {
  return apiFetch("/api/v1/payments/create-order", {
    method: "POST",
    body: JSON.stringify({ planId }),
  });
}

/**
 * Step 2: Verify payment signatures on backend
 * Calls POST /api/v1/payments/verify with { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentMethod }
 * Backend performs HMAC-SHA256 verification and activates user account in database.
 */
export async function verifyRazorpayPayment(verificationData) {
  return apiFetch("/api/v1/payments/verify", {
    method: "POST",
    body: JSON.stringify(verificationData),
  });
}

/**
 * Backward-compatible helper for legacy components
 */
export async function submitRolePayment(checkoutData) {
  const role = (checkoutData.role || "BUYER").toUpperCase();
  const plan = PRICING_PLANS[role] || PRICING_PLANS.BUYER;
  return createRazorpayOrder(plan.id);
}

/**
 * Fetch authenticated user's payment history from backend
 */
export async function getPaymentHistory() {
  const res = await apiFetch("/api/v1/payments/history", { method: "GET" });
  if (res.success && Array.isArray(res.data)) {
    return {
      success: true,
      data: res.data,
    };
  }
  return {
    success: false,
    data: [],
    error: res.error || "Failed to fetch payment history.",
  };
}

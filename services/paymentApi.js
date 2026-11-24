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
    name: "Buyer Verified Plan",
    basePrice: 365,
    taxAmount: 0,
    totalAmount: 365,
    currency: "INR",
    billingCycle: "Annual Access (₹1.00/day)",
    description: "Full 1-year verified access to connect directly with agricultural cultivators, farmers, and FPOs.",
    benefits: [
      "100% Verified Buyer & Procurement Badge",
      "Direct access to farmer harvest & produce listings",
      "Direct phone and WhatsApp contact with verified farmers",
      "Create bulk procurement requests & RFQs",
      "Zero middleman brokerage & zero trade commission",
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
    billingCycle: "Annual Access (₹1.00/day)",
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
 * Fetch live authenticated user profile from backend (/api/v1/user/me)
 * Used to immediately synchronize Supabase database states (buyerPaid, buyerOnboarded, etc.)
 */
export async function fetchCurrentUserProfile() {
  const res = await apiFetch("/api/v1/user/me", { method: "GET" });
  if (res.success && res.data) {
    const userObj = res.data?.user || res.data?.data || res.data;
    return {
      success: true,
      user: userObj,
    };
  }
  return {
    success: false,
    user: null,
    error: res.error || "Unable to fetch live user profile.",
  };
}
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

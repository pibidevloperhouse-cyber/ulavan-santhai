import crypto from 'node:crypto';
import { razorpayClient, getRazorpayKeyId } from '../config/razorpay.js';
import * as planRepository from '../repositories/plan.repository.js';
import * as paymentRepository from '../repositories/payment.repository.js';
import * as userRepository from '../repositories/user.repository.js';
import * as sellerCategoryRepository from '../repositories/sellerCategory.repository.js';
import * as applicationRepository from '../repositories/application.repository.js';
import {
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
} from '../utils/cryptoSecurity.js';

/**
 * Format paise into decimal Rupee string (e.g. 36500 -> "365.00")
 * @param {number} paise
 * @returns {string}
 */
const formatRupees = (paise) => {
  return (Number(paise) / 100).toFixed(2);
};

/**
 * Service: List available active membership plans from Supabase PostgreSQL
 * @param {string} [role]
 * @returns {Promise<Array<object>>}
 */
export const getAvailablePlansService = async (role) => {
  const dbPlans = await planRepository.findAllActive(role);
  return dbPlans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    role: plan.role,
    priceInPaise: plan.priceInPaise,
    amountRupees: formatRupees(plan.priceInPaise),
    currency: plan.currency,
    durationDays: plan.durationDays,
    description: plan.description,
    features: plan.features,
  }));
};

/**
 * Service: Create Razorpay Order using authoritative plan fetched from Supabase PostgreSQL
 * @param {object} params
 * @param {string} params.userId
 * @param {string} [params.planId]
 * @param {Array<string>|string} [params.categories]
 * @returns {Promise<object>}
 */
export const createRazorpayOrderService = async ({ userId, planId, categories }) => {
  if (!userId) {
    const error = new Error('User authentication required. Unverified credentials rejected.');
    error.statusCode = 401;
    throw error;
  }

  // 1. Fetch user to check active status and role subscriptions
  const user = await userRepository.findById(userId);
  if (!user) {
    const error = new Error('User account not found.');
    error.statusCode = 404;
    throw error;
  }

  // Determine if this is a Buyer plan
  const requestedPlanId = String(planId || '').trim().toUpperCase();
  const isBuyerPlan = requestedPlanId === 'BUYER_ANNUAL';

  if (isBuyerPlan) {
    if (user.buyerPaid) {
      const error = new Error('You already have an active Buyer membership. Duplicate payment rejected.');
      error.statusCode = 409;
      error.code = 'MEMBERSHIP_ALREADY_ACTIVE';
      throw error;
    }

    const plan = await planRepository.findActiveById(requestedPlanId);
    if (!plan || !plan.isActive) {
      const error = new Error(`Invalid or inactive plan selected: ${planId}`);
      error.statusCode = 400;
      throw error;
    }

    const receipt = `rcpt_${userId.slice(0, 8)}_${Date.now()}`;
    let order;
    try {
      order = await razorpayClient.orders.create({
        amount: plan.priceInPaise,
        currency: plan.currency,
        receipt,
        notes: {
          userId,
          planId: plan.id,
          planName: plan.name,
          role: plan.role,
        },
      });
    } catch (rzpErr) {
      console.error('[RAZORPAY ERROR] Failed to create order:', rzpErr?.error?.description || rzpErr.message);
      const error = new Error('Failed to initialize payment gateway order. Please try again.');
      error.statusCode = 502;
      throw error;
    }

    const paymentId = `PAY_${Date.now()}_${crypto.randomInt(1000, 9999)}`;
    await paymentRepository.createPaymentRecord({
      id: paymentId,
      userId,
      orderId: order.id,
      amount: formatRupees(plan.priceInPaise),
      amountPaise: plan.priceInPaise,
      currency: plan.currency,
      role: plan.role,
      plan: plan.name,
      planId: plan.id,
      status: 'CREATED',
    });

    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      amountRupees: formatRupees(order.amount),
      currency: order.currency,
      keyId: getRazorpayKeyId(),
      plan: {
        id: plan.id,
        name: plan.name,
        amount: Math.round(plan.priceInPaise / 100),
        amountRupees: formatRupees(plan.priceInPaise),
        description: plan.description,
      },
    };
  }

  // Seller Payment Flow
  if (user.sellerPaid) {
    const error = new Error('You already have an active Seller membership. Duplicate payment rejected.');
    error.statusCode = 409;
    error.code = 'MEMBERSHIP_ALREADY_ACTIVE';
    throw error;
  }

  // 2. Resolve target seller classifications
  let targetCategories = [];
  if (Array.isArray(categories) && categories.length > 0) {
    targetCategories = categories;
  } else if (typeof categories === 'string' && categories.trim()) {
    targetCategories = categories.split(',').map((s) => s.trim()).filter(Boolean);
  } else {
    // Zero Client Trust fallback: check user's latest submitted application
    const latestApp = await applicationRepository.findLatestByUserId(userId);
    if (latestApp && String(latestApp.role).toUpperCase() === 'SELLER') {
      if (Array.isArray(latestApp.profilePayload?.selectedSellerTypes) && latestApp.profilePayload.selectedSellerTypes.length > 0) {
        targetCategories = latestApp.profilePayload.selectedSellerTypes;
      } else if (Array.isArray(latestApp.profilePayload?.selectedCategories) && latestApp.profilePayload.selectedCategories.length > 0) {
        targetCategories = latestApp.profilePayload.selectedCategories;
      } else if (Array.isArray(latestApp.profilePayload?.categoryIds) && latestApp.profilePayload.categoryIds.length > 0) {
        targetCategories = latestApp.profilePayload.categoryIds;
      } else if (latestApp.subType) {
        targetCategories = String(latestApp.subType).split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
  }

  // 3. Query authoritative category and plan pricing from Supabase PostgreSQL
  let matchedCategories = [];
  if (targetCategories.length > 0) {
    matchedCategories = await sellerCategoryRepository.findByCodesOrNamesWithPlans(targetCategories);
  }

  let totalAmountPaise = 0;
  let currency = 'INR';
  let planName = '';
  let resolvedPlanId = null;
  let breakdown = [];

  if (matchedCategories.length > 0) {
    // Strictly calculate price based on each category's plan_id price fetched from membership_plans
    totalAmountPaise = matchedCategories.reduce((sum, c) => {
      const price = Number(c.priceInPaise);
      if (isNaN(price) || price <= 0) {
        throw new Error(`Invalid pricing configured in database for category: ${c.code || c.id}`);
      }
      return sum + price;
    }, 0);
    currency = matchedCategories[0].currency || 'INR';
    const categoryNames = matchedCategories.map((c) => c.name).join(', ');
    planName = `Seller Membership (${matchedCategories.length} Categories: ${categoryNames})`;
    resolvedPlanId = matchedCategories.length === 1 ? matchedCategories[0].planId : 'SELLER_CUSTOM';
    breakdown = matchedCategories.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      planId: c.planId,
      priceInPaise: Number(c.priceInPaise),
      amountRupees: formatRupees(Number(c.priceInPaise)),
    }));
  } else {
    // Fallback: strictly fetch default plan pricing from public.membership_plans in database
    const defaultPlan = planId 
      ? await planRepository.findActiveById(planId)
      : await planRepository.getDefaultPlan('SELLER');

    if (!defaultPlan || !defaultPlan.isActive) {
      const error = new Error(`No active membership plan found in database for role SELLER`);
      error.statusCode = 400;
      throw error;
    }
    totalAmountPaise = defaultPlan.priceInPaise;
    currency = defaultPlan.currency;
    planName = defaultPlan.name;
    resolvedPlanId = defaultPlan.id;
    breakdown = [
      {
        id: defaultPlan.id,
        code: defaultPlan.id,
        name: defaultPlan.name,
        planId: defaultPlan.id,
        priceInPaise: defaultPlan.priceInPaise,
        amountRupees: formatRupees(defaultPlan.priceInPaise),
      },
    ];
  }

  const receipt = `rcpt_${userId.slice(0, 8)}_${Date.now()}`;

  // 4. Call Razorpay API to generate order with database-governed price
  let order;
  try {
    order = await razorpayClient.orders.create({
      amount: totalAmountPaise,
      currency,
      receipt,
      notes: {
        userId,
        planId: resolvedPlanId,
        planName,
        categoryCount: matchedCategories.length || 1,
        categories: matchedCategories.map((c) => c.name).join(', ') || 'Default Seller',
      },
    });
  } catch (rzpErr) {
    console.error('[RAZORPAY ERROR] Failed to create order:', rzpErr?.error?.description || rzpErr.message);
    const error = new Error('Failed to initialize payment gateway order. Please try again.');
    error.statusCode = 502;
    throw error;
  }

  // 5. Persist order in database with status 'CREATED' and itemized breakdown
  const paymentId = `PAY_${Date.now()}_${crypto.randomInt(1000, 9999)}`;
  await paymentRepository.createPaymentRecord({
    id: paymentId,
    userId,
    orderId: order.id,
    amount: formatRupees(totalAmountPaise),
    amountPaise: totalAmountPaise,
    currency,
    role: 'SELLER',
    plan: planName,
    planId: resolvedPlanId,
    status: 'CREATED',
    metadata: {
      categoryCount: matchedCategories.length || 1,
      breakdown,
      categories: matchedCategories.map((c) => c.name),
    },
  });

  console.log(`[PAYMENT] Created Razorpay order ${order.id} for user ${userId} (${order.amount} paise, ${breakdown.length} categories)`);

  return {
    success: true,
    orderId: order.id,
    amount: order.amount,
    amountRupees: formatRupees(order.amount),
    currency: order.currency,
    keyId: getRazorpayKeyId(),
    categoryCount: breakdown.length,
    breakdown,
    plan: {
      id: resolvedPlanId,
      name: planName,
      amount: Math.round(totalAmountPaise / 100),
      amountRupees: formatRupees(totalAmountPaise),
    },
  };
};

/**
 * Service: Cryptographically verify Razorpay payment signature and confirm membership
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.razorpayOrderId
 * @param {string} params.razorpayPaymentId
 * @param {string} params.razorpaySignature
 * @param {string} [params.paymentMethod]
 * @returns {Promise<object>}
 */
export const verifyRazorpayPaymentService = async ({
  userId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  paymentMethod,
}) => {
  if (!userId) {
    const error = new Error('User authentication required. Unverified credentials rejected.');
    error.statusCode = 401;
    throw error;
  }

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    const error = new Error('Missing required payment parameters: order ID, payment ID, and signature are required.');
    error.statusCode = 400;
    throw error;
  }

  // 1. Query order record in database
  const paymentRecord = await paymentRepository.findByOrderId(razorpayOrderId);
  if (!paymentRecord) {
    const error = new Error(`Order ${razorpayOrderId} not found in database records.`);
    error.statusCode = 404;
    throw error;
  }

  // 2. Identity Pinning: Ensure the authenticated user owns this order
  if (paymentRecord.userId !== userId) {
    console.warn(`[SECURITY ALERT] User ${userId} attempted to verify order ${razorpayOrderId} owned by ${paymentRecord.userId}`);
    const error = new Error('Unauthorized: Payment order does not belong to the authenticated user.');
    error.statusCode = 403;
    throw error;
  }

  // 3. Idempotency Check: If already confirmed, return success immediately
  if (paymentRecord.status === 'CONFIRMED') {
    return {
      success: true,
      message: 'Payment has already been verified and confirmed.',
      payment: {
        id: paymentRecord.id,
        orderId: paymentRecord.orderId,
        transactionId: paymentRecord.transactionId,
        amount: paymentRecord.amount,
        plan: paymentRecord.plan,
        role: paymentRecord.role,
        status: paymentRecord.status,
        paidAt: paymentRecord.paidAt,
      },
    };
  }

  // 4. Replay Attack Defense: Check if this payment ID was already used for a different order
  const existingPaymentWithTxn = await paymentRepository.findByTransactionId(razorpayPaymentId);
  if (existingPaymentWithTxn && existingPaymentWithTxn.orderId !== razorpayOrderId) {
    console.warn(`[SECURITY ALERT] Payment ID ${razorpayPaymentId} already claimed by order ${existingPaymentWithTxn.orderId}. Replay rejected.`);
    const error = new Error('This payment ID has already been processed and confirmed for an existing order.');
    error.statusCode = 409;
    error.code = 'PAYMENT_ALREADY_USED';
    throw error;
  }

  // 5. Strict Constant-Time Cryptographic HMAC-SHA256 Signature Verification
  // Pre-hashed comparison eliminates timing side-channels and buffer length discrepancies
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new Error('[SECURITY FATAL] RAZORPAY_KEY_SECRET is not configured in environment variables.');
  }

  const isAuthentic = verifyRazorpayPaymentSignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
    secret,
  });

  if (!isAuthentic) {
    console.warn(`[PAYMENT SECURITY] Invalid signature submitted for order ${razorpayOrderId}`);
    await paymentRepository.markPaymentFailed(razorpayOrderId, { failureReason: 'INVALID_SIGNATURE' });
    const error = new Error('Invalid payment signature. Verification failed.');
    error.statusCode = 400;
    throw error;
  }

  // 5. Update payment status to CONFIRMED
  const confirmedPayment = await paymentRepository.markPaymentConfirmed(razorpayOrderId, {
    transactionId: razorpayPaymentId,
    signature: razorpaySignature,
    paymentMethod: paymentMethod || 'UPI',
  });

  // 6. Update user's onboarded and paid state based on plan role
  try {
    if (paymentRecord.role === 'BUYER') {
      await userRepository.update(userId, {
        buyerOnboarded: true,
        buyerPaid: true,
      });
      console.log(`[PAYMENT] Activated BUYER account for user ${userId}. (buyerPaid=true, buyerOnboarded=true)`);
    } else if (paymentRecord.role === 'SELLER') {
      await userRepository.update(userId, {
        sellerOnboarded: true,
        sellerPaid: true,
      });
      console.log(`[PAYMENT] Activated SELLER account for user ${userId}. (sellerPaid=true, sellerOnboarded=true)`);
    }
  } catch (userErr) {
    console.warn(`[PAYMENT] Failed to update onboarding status for user ${userId}:`, userErr.message);
  }

  console.log(`[PAYMENT] Confirmed payment ${confirmedPayment.id} for user ${userId}. Txn: ${razorpayPaymentId}`);

  const invoiceNumber = `INV-US-${new Date().getFullYear()}-${confirmedPayment.id.slice(-6).toUpperCase()}`;

  return {
    success: true,
    message: paymentRecord.role === 'BUYER'
      ? 'Payment verified successfully. Buyer account activated.'
      : 'Payment verified and membership confirmed successfully.',
    invoiceNumber,
    paymentId: razorpayPaymentId,
    payment: {
      id: confirmedPayment.id,
      orderId: confirmedPayment.orderId,
      transactionId: confirmedPayment.transactionId,
      amount: confirmedPayment.amount,
      plan: confirmedPayment.plan,
      role: confirmedPayment.role,
      status: confirmedPayment.status,
      paidAt: confirmedPayment.paidAt,
    },
  };
};

/**
 * Service: Process Razorpay Webhook Event (Server-to-Server)
 * @param {object} params
 * @param {Buffer|string} params.rawBody
 * @param {string} params.signature
 * @param {object} params.body
 * @returns {Promise<object>}
 */
export const processRazorpayWebhookService = async ({ rawBody, signature, body }) => {
  if (!signature) {
    const error = new Error('Missing x-razorpay-signature header in webhook request.');
    error.statusCode = 400;
    throw error;
  }

  // 1. Strict Constant-Time Cryptographic Webhook Signature Verification
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
  if (!webhookSecret) {
    throw new Error('[SECURITY FATAL] Razorpay webhook secret is not configured in environment variables.');
  }

  const isAuthentic = verifyRazorpayWebhookSignature({
    rawBody,
    signature,
    secret: webhookSecret,
  });

  if (!isAuthentic) {
    console.warn('[WEBHOOK SECURITY] Invalid webhook signature received from remote server.');
    const error = new Error('Invalid webhook signature. Request rejected.');
    error.statusCode = 400;
    throw error;
  }

  const event = body?.event;
  const eventPayload = body?.payload;

  console.log(`[WEBHOOK] Received authenticated Razorpay event: ${event}`);

  // Handle successful payment events
  if (event === 'order.paid' || event === 'payment.captured') {
    const paymentEntity = eventPayload?.payment?.entity;
    const orderEntity = eventPayload?.order?.entity;

    const orderId = paymentEntity?.order_id || orderEntity?.id;
    const paymentId = paymentEntity?.id;
    const method = paymentEntity?.method || 'UPI';

    if (!orderId) {
      console.warn(`[WEBHOOK] Event ${event} received without order_id.`);
      return { success: true, message: 'Event ignored: no order_id found.' };
    }

    const paymentRecord = await paymentRepository.findByOrderId(orderId);
    if (!paymentRecord) {
      console.warn(`[WEBHOOK] Order ${orderId} not found in database records.`);
      return { success: true, message: 'Order not tracked in local database.' };
    }

    // Idempotency: If already confirmed, acknowledge receipt cleanly
    if (paymentRecord.status === 'CONFIRMED') {
      console.log(`[WEBHOOK] Order ${orderId} already confirmed. Skipping redundant processing.`);
      return { success: true, message: 'Order already confirmed.' };
    }

    // Transition status to CONFIRMED
    const confirmedPayment = await paymentRepository.markPaymentConfirmed(orderId, {
      transactionId: paymentId || `txn_${Date.now()}`,
      signature: signature,
      paymentMethod: method,
    });

    // Auto-activate buyer or seller onboarding and payment status via webhook
    try {
      if (paymentRecord.role === 'BUYER') {
        await userRepository.update(paymentRecord.userId, {
          buyerOnboarded: true,
          buyerPaid: true,
        });
        console.log(`[WEBHOOK] Buyer account ${paymentRecord.userId} auto-activated via webhook.`);
      } else if (paymentRecord.role === 'SELLER') {
        await userRepository.update(paymentRecord.userId, {
          sellerOnboarded: true,
          sellerPaid: true,
        });
        console.log(`[WEBHOOK] Seller account ${paymentRecord.userId} auto-activated via webhook.`);
      }
    } catch (userErr) {
      console.warn(`[WEBHOOK] Failed to update onboarding status for ${paymentRecord.userId}:`, userErr.message);
    }

    return {
      success: true,
      message: 'Payment confirmed via webhook.',
      paymentId: confirmedPayment.id,
      orderId,
    };
  }

  // Handle payment failure event
  if (event === 'payment.failed') {
    const paymentEntity = eventPayload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    if (orderId) {
      await paymentRepository.markPaymentFailed(orderId, {
        failureReason: paymentEntity?.error_description || 'PAYMENT_FAILED_GATEWAY',
      });
      console.log(`[WEBHOOK] Marked order ${orderId} as FAILED based on gateway notification.`);
    }
  }

  return { success: true, message: `Event ${event} acknowledged.` };
};

/**
 * Service: Process & Record Payment (Legacy / Direct fallback)
 */
export const processPaymentService = async ({
  paymentRecord = {},
  reviewRequest = {},
  userId: directUserId,
  transactionId: directTxnId,
  amount: directAmount,
  role: directRole,
  plan: directPlan,
  paymentMethod: directMethod,
  user,
} = {}) => {
  const userId = user?.id || directUserId;

  if (!userId) {
    const error = new Error('User authentication required for payment. Unverified credentials rejected.');
    error.statusCode = 401;
    throw error;
  }

  const paymentId =
    paymentRecord.id ||
    reviewRequest.paymentId ||
    `PAY_${crypto.randomInt(100000, 999999)}`;

  const transactionId =
    paymentRecord.transactionId ||
    reviewRequest.transactionId ||
    directTxnId ||
    `TXN_${crypto.randomInt(100000, 999999)}`;

  let rawAmount =
    paymentRecord.totalAmount ||
    paymentRecord.baseAmount ||
    reviewRequest.amount ||
    directAmount;

  if (!rawAmount) {
    const roleForPlan = String(paymentRecord.role || reviewRequest.role || directRole || 'SELLER').toUpperCase();
    const defaultPlan = await planRepository.getDefaultPlan(roleForPlan);
    rawAmount = defaultPlan ? (defaultPlan.priceInPaise / 100).toFixed(2) : 0;
  }

  const numericAmount = parseFloat(rawAmount).toFixed(2);
  const normalizedRole = String(
    paymentRecord.role || reviewRequest.role || directRole || 'BUYER'
  ).toUpperCase();

  const plan = String(
    paymentRecord.planName ||
    paymentRecord.planId ||
    reviewRequest.planName ||
    directPlan ||
    'Verified Membership Plan'
  ).slice(0, 100);

  const paymentMethod = String(
    paymentRecord.paymentMethod ||
    reviewRequest.paymentMethod ||
    directMethod ||
    'UPI'
  ).slice(0, 50);

  const status = String(
    paymentRecord.paymentStatus || reviewRequest.reviewStatus || 'CONFIRMED'
  ).slice(0, 30);

  const savedPayment = await paymentRepository.create({
    id: paymentId,
    userId,
    transactionId,
    amount: numericAmount,
    role: normalizedRole,
    paymentMethod,
    plan,
    status,
    paidAt: new Date(),
  });

  if (status === 'CONFIRMED' || status === 'SUCCESS') {
    try {
      if (normalizedRole === 'BUYER') {
        await userRepository.update(userId, {
          buyerOnboarded: true,
          buyerPaid: true,
        });
        console.log(`[PAYMENT] Activated BUYER account for user ${userId}. (buyerPaid=true, buyerOnboarded=true)`);
      } else if (normalizedRole === 'SELLER') {
        await userRepository.update(userId, {
          sellerOnboarded: true,
          sellerPaid: true,
        });
        console.log(`[PAYMENT] Activated SELLER account for user ${userId}. (sellerPaid=true, sellerOnboarded=true)`);
      }
    } catch (userErr) {
      console.warn(`[PAYMENT] Failed to update onboarding status for user ${userId}:`, userErr.message);
    }
  }

  console.log(`[PAYMENT] Recorded direct payment ${savedPayment.id} for user ${userId}: amount=${numericAmount}`);

  return {
    success: true,
    message: 'Payment recorded successfully.',
    payment: {
      id: savedPayment.id,
      transactionId: savedPayment.transactionId,
      amount: savedPayment.amount,
      plan: savedPayment.plan,
      role: savedPayment.role,
      status: savedPayment.status,
      paidAt: savedPayment.paidAt,
    },
  };
};

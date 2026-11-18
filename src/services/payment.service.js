import crypto from 'node:crypto';
import { razorpayClient, getRazorpayKeyId } from '../config/razorpay.js';
import * as planRepository from '../repositories/plan.repository.js';
import * as paymentRepository from '../repositories/payment.repository.js';
import * as userRepository from '../repositories/user.repository.js';

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
 * @returns {Promise<object>}
 */
export const createRazorpayOrderService = async ({ userId, planId }) => {
  if (!userId) {
    const error = new Error('User authentication required. Unverified credentials rejected.');
    error.statusCode = 401;
    throw error;
  }

  // 1. Fetch authoritative plan directly from database - Zero client trust
  let plan = null;
  if (planId) {
    plan = await planRepository.findActiveById(planId);
  } else {
    plan = await planRepository.getDefaultPlan('SELLER');
  }

  if (!plan || !plan.isActive) {
    const error = new Error(`Invalid or inactive plan selected: ${planId || 'DEFAULT'}`);
    error.statusCode = 400;
    throw error;
  }

  const receipt = `rcpt_${userId.slice(0, 8)}_${Date.now()}`;

  // 2. Call Razorpay API to generate order with database-governed price
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
    const error = new Error(rzpErr?.error?.description || 'Failed to initialize payment gateway order.');
    error.statusCode = 502;
    throw error;
  }

  // 3. Persist order in database with status 'CREATED'
  const paymentId = `PAY_${Date.now()}_${crypto.randomInt(1000, 9999)}`;
  const savedPayment = await paymentRepository.createPaymentRecord({
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

  console.log(`[PAYMENT] Created Razorpay order ${order.id} for user ${userId} using DB plan ${plan.id} (${order.amount} paise)`);

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
      description: plan.description,
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

  // 5. Timing-safe cryptographic HMAC-SHA256 signature verification
  const secret = process.env.RAZORPAY_KEY_SECRET || '';
  const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  let isMatch = false;
  try {
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const providedBuffer = Buffer.from(razorpaySignature, 'utf8');
    if (expectedBuffer.length === providedBuffer.length) {
      isMatch = crypto.timingSafeEqual(expectedBuffer, providedBuffer);
    }
  } catch (err) {
    isMatch = false;
  }

  if (!isMatch) {
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

  // 6. Update user's onboarded state if role is SELLER
  try {
    if (paymentRecord.role === 'SELLER') {
      await userRepository.update(userId, { sellerOnboarded: true });
    }
  } catch (userErr) {
    console.warn(`[PAYMENT] Note: Failed to flag sellerOnboarded on user ${userId}:`, userErr.message);
  }

  console.log(`[PAYMENT] Confirmed payment ${confirmedPayment.id} for user ${userId}. Txn: ${razorpayPaymentId}`);

  return {
    success: true,
    message: 'Payment verified and membership confirmed successfully.',
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

  // 1. Cryptographic Webhook Signature Verification
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || '';
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody || '')
    .digest('hex');

  let isMatch = false;
  try {
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const providedBuffer = Buffer.from(signature, 'utf8');
    if (expectedBuffer.length === providedBuffer.length) {
      isMatch = crypto.timingSafeEqual(expectedBuffer, providedBuffer);
    }
  } catch (err) {
    isMatch = false;
  }

  if (!isMatch) {
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

    // Auto-activate seller onboarding
    if (paymentRecord.role === 'SELLER') {
      try {
        await userRepository.update(paymentRecord.userId, { sellerOnboarded: true });
        console.log(`[WEBHOOK] Seller account ${paymentRecord.userId} auto-activated via webhook.`);
      } catch (userErr) {
        console.warn(`[WEBHOOK] Failed to update sellerOnboarded for ${paymentRecord.userId}:`, userErr.message);
      }
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

  const rawAmount =
    paymentRecord.totalAmount ||
    paymentRecord.baseAmount ||
    reviewRequest.amount ||
    directAmount ||
    365.0;

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

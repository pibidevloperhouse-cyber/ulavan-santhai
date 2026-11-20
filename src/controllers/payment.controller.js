import * as paymentService from '../services/payment.service.js';
import { assertAuthenticated } from '../utils/authGuard.js';

/**
 * Controller: List available platform plans
 * @route GET /api/v1/payments/plans
 */
export const getPaymentPlans = async (req, res) => {
  try {
    const plans = await paymentService.getAvailablePlansService(req.query?.role);
    return res.status(200).json({
      success: true,
      plans,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to retrieve plans.',
    });
  }
};

/**
 * Controller: Create Razorpay Order (Gate 2 Guarded)
 * @route POST /api/v1/payments/create-order
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    // Gate 2 Assertion: Re-verify JWT and authenticate user identity
    const authUser = assertAuthenticated(req);

    const result = await paymentService.createRazorpayOrderService({
      userId: authUser.id,
      planId: req.body?.planId || req.body?.plan_id,
    });

    return res.status(201).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      ...(err.code && { code: err.code }),
      message: process.env.NODE_ENV === 'production' && (!err.statusCode || err.statusCode >= 500)
        ? 'Failed to initialize payment gateway order. Please try again.'
        : (err.message || 'Order creation failed.'),
    });
  }
};

/**
 * Controller: Verify Razorpay Payment Signature (Gate 2 Guarded)
 * @route POST /api/v1/payments/verify & POST /api/v1/payments/verify-signature
 */
export const verifyRazorpayPayment = async (req, res) => {
  try {
    // Gate 2 Assertion: Re-verify JWT and authenticate user identity
    const authUser = assertAuthenticated(req);

    const razorpayOrderId =
      req.body?.razorpay_order_id ||
      req.body?.orderId ||
      req.body?.razorpayOrderId;

    const razorpayPaymentId =
      req.body?.razorpay_payment_id ||
      req.body?.paymentId ||
      req.body?.razorpayPaymentId;

    const razorpaySignature =
      req.body?.razorpay_signature ||
      req.body?.signature ||
      req.body?.razorpaySignature;

    const paymentMethod =
      req.body?.paymentMethod ||
      req.body?.payment_method ||
      'UPI';

    const result = await paymentService.verifyRazorpayPaymentService({
      userId: authUser.id,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentMethod,
    });

    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      code: err.code || 'PAYMENT_VERIFICATION_FAILED',
      message: process.env.NODE_ENV === 'production' && (!err.statusCode || err.statusCode >= 500)
        ? 'Payment verification failed. Please contact support.'
        : (err.message || 'Payment verification failed.'),
    });
  }
};

/**
 * Controller: Handle Razorpay Webhook Events (Server-to-Server)
 * @route POST /api/v1/payments/webhook & POST /api/payments/webhook
 */
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody || JSON.stringify(req.body);

    const result = await paymentService.processRazorpayWebhookService({
      rawBody,
      signature,
      body: req.body,
    });

    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Webhook processing failed.',
    });
  }
};

/**
 * Controller: Record Payment (Legacy Direct Fallback - Gate 2 Guarded)
 * @route POST /api/v1/payments & POST /api/payments
 */
export const processPayment = async (req, res) => {
  try {
    // Gate 2 Assertion: Re-verify JWT and authenticate user identity
    const authUser = assertAuthenticated(req);

    const result = await paymentService.processPaymentService({
      ...req.body,
      userId: authUser.id,
      user: authUser,
    });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Payment processing failed.',
    });
  }
};

import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  getPaymentPlans,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
  processPayment,
} from '../controllers/payment.controller.js';

const router = Router();

// Route 1: Retrieve Active Membership Plans
// Endpoints: GET /api/v1/payments/plans & GET /api/payments/plans
router.get('/plans', getPaymentPlans);

// Route 2: Create Razorpay Order - Gate 1 Protected
// Endpoints: POST /api/v1/payments/create-order & POST /api/payments/create-order
router.post('/create-order', verifyToken, createRazorpayOrder);

// Route 3: Cryptographically Verify Razorpay Payment - Gate 1 Protected
// Endpoints: POST /api/v1/payments/verify & POST /api/v1/payments/verify-signature
router.post('/verify', verifyToken, verifyRazorpayPayment);
router.post('/verify-signature', verifyToken, verifyRazorpayPayment);

// Route 4: Razorpay Webhook Receiver - Server-to-Server HMAC Authenticated
// Endpoints: POST /api/v1/payments/webhook & POST /api/payments/webhook
router.post('/webhook', handleRazorpayWebhook);

// Route 4: Record Direct/Legacy Payment - Gate 1 Protected
// Endpoints: POST /api/v1/payments & POST /api/payments
router.post('/', verifyToken, processPayment);
router.post('/payment', verifyToken, processPayment);

export default router;

process.env.NODE_ENV = 'test';
import dotenv from 'dotenv';
dotenv.config();

import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { app } from '../src/server.js';
import * as userRepository from '../src/repositories/user.repository.js';
import * as paymentRepository from '../src/repositories/payment.repository.js';

let testServer;
let baseUrl;

async function startServer() {
  return new Promise((resolve) => {
    testServer = app.listen(0, '127.0.0.1', () => {
      const port = testServer.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`[TEST SERVER] Running on ${baseUrl}`);
      resolve();
    });
  });
}

async function stopServer() {
  if (testServer) {
    await new Promise((resolve) => testServer.close(resolve));
  }
}

async function runRazorpayIntegrationTests() {
  console.log('[TEST] Starting Razorpay Real-Time Payment Integration Test Suite...');

  await startServer();

  try {
    const timestamp = Date.now();
    const testEmailA = `seller_a_${timestamp}@test.com`;
    const testEmailB = `seller_b_${timestamp}@test.com`;
    const testMobileA = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
    const testMobileB = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
    const testPassword = 'Password123!';

    // =========================================================================
    // STEP 1: Verify Public Plans Catalog (Authoritative Pricing)
    // =========================================================================
    console.log('\n--- STEP 1: Verify Authoritative Plans Catalog ---');
    const plansRes = await fetch(`${baseUrl}/api/v1/payments/plans`);
    const plansData = await plansRes.json();
    console.log('[STEP 1] Plans API response:', plansData);

    if (!plansRes.ok || !plansData.success || !Array.isArray(plansData.plans)) {
      throw new Error('Failed to retrieve plans catalog');
    }

    const sellerPlan = plansData.plans.find((p) => p.id === 'SELLER_ANNUAL');
    if (!sellerPlan) throw new Error('SELLER_ANNUAL plan missing from catalog');
    if (sellerPlan.priceInPaise !== 36500 || sellerPlan.amountRupees !== '365.00') {
      throw new Error(`Plan price incorrect: expected 36500 paise, got ${sellerPlan.priceInPaise}`);
    }
    console.log('[STEP 1] PASSED: Authoritative plan price verified at 36500 paise (INR 365.00)');

    // =========================================================================
    // STEP 2: Create Test Sellers & Generate Authenticated JWT Tokens
    // =========================================================================
    console.log('\n--- STEP 2: Creating Test Sellers & Auth Tokens ---');
    const userA = await userRepository.create({
      id: `usr_a_${timestamp}`,
      name: 'Seller Alpha',
      username: `seller_a_${timestamp}`,
      email: testEmailA,
      mobile: testMobileA,
      password: testPassword,
      role: 'SELLER',
      isVerified: true,
      sellerOnboarded: false,
    });

    const userB = await userRepository.create({
      id: `usr_b_${timestamp}`,
      name: 'Seller Beta',
      username: `seller_b_${timestamp}`,
      email: testEmailB,
      mobile: testMobileB,
      password: testPassword,
      role: 'SELLER',
      isVerified: true,
      sellerOnboarded: false,
    });

    const jwtSecret = process.env.JWT_SECRET;
    const tokenA = jwt.sign({ id: userA.id, email: userA.email, role: 'SELLER' }, jwtSecret, { expiresIn: '1h' });
    const tokenB = jwt.sign({ id: userB.id, email: userB.email, role: 'SELLER' }, jwtSecret, { expiresIn: '1h' });

    console.log(`[STEP 2] PASSED: Created Seller A (${userA.id}) and Seller B (${userB.id})`);

    // =========================================================================
    // STEP 3: Gate 1 & Gate 2 Auth Protection
    // =========================================================================
    console.log('\n--- STEP 3: Gate 1 & Gate 2 Protection on /create-order ---');
    const unauthRes = await fetch(`${baseUrl}/api/v1/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: 'SELLER_ANNUAL' }),
    });

    if (unauthRes.status !== 401) {
      throw new Error(`Expected HTTP 401 Unauthorized, got ${unauthRes.status}`);
    }
    console.log('[STEP 3] PASSED: Unauthenticated request rejected with HTTP 401');

    // =========================================================================
    // STEP 4: Real-Time Razorpay Order Creation via Razorpay SDK
    // =========================================================================
    console.log('\n--- STEP 4: Real-Time Razorpay Order Creation ---');
    const createOrderRes = await fetch(`${baseUrl}/api/v1/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        planId: 'SELLER_ANNUAL',
        // Attempt price tampering (server must strictly ignore this)
        amount: 100,
        priceInPaise: 100,
      }),
    });

    const orderData = await createOrderRes.json();
    console.log('[STEP 4] Order creation response:', orderData);

    if (!createOrderRes.ok || !orderData.success) {
      throw new Error(`Order creation failed: ${JSON.stringify(orderData)}`);
    }

    if (!orderData.orderId || !orderData.orderId.startsWith('order_')) {
      throw new Error(`Invalid Razorpay order ID received: ${orderData.orderId}`);
    }

    if (orderData.amount !== 36500) {
      throw new Error(`Price tampering succeeded! Server used ${orderData.amount} instead of 36500`);
    }

    if (!orderData.keyId || !orderData.keyId.startsWith('rzp_test_')) {
      throw new Error(`Invalid publishable key ID returned: ${orderData.keyId}`);
    }

    // Verify order in database
    const dbPaymentCreated = await paymentRepository.findByOrderId(orderData.orderId);
    if (!dbPaymentCreated) {
      throw new Error(`Order ${orderData.orderId} was not stored in database payments table`);
    }
    if (dbPaymentCreated.status !== 'CREATED') {
      throw new Error(`Expected initial status CREATED, got ${dbPaymentCreated.status}`);
    }
    if (dbPaymentCreated.userId !== userA.id) {
      throw new Error(`Expected userId ${userA.id}, got ${dbPaymentCreated.userId}`);
    }

    console.log(`[STEP 4] PASSED: Real Razorpay order ${orderData.orderId} created & saved in DB in CREATED status.`);

    // =========================================================================
    // STEP 5: Cryptographic Signature Tampering Rejection
    // =========================================================================
    console.log('\n--- STEP 5: Cryptographic Signature Tampering Check ---');
    const fakePaymentId = `pay_fake_${Date.now()}`;
    const fakeSignature = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

    const fakeVerifyRes = await fetch(`${baseUrl}/api/v1/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        razorpay_order_id: orderData.orderId,
        razorpay_payment_id: fakePaymentId,
        razorpay_signature: fakeSignature,
      }),
    });

    const fakeVerifyData = await fakeVerifyRes.json();
    console.log('[STEP 5] Fake signature response:', fakeVerifyData);

    if (fakeVerifyRes.status !== 400 || fakeVerifyData.success !== false) {
      throw new Error(`Expected HTTP 400 rejection for forged signature, got ${fakeVerifyRes.status}`);
    }
    console.log('[STEP 5] PASSED: Forged payment signature rejected with HTTP 400.');

    // =========================================================================
    // STEP 6: Identity Pinning Protection (Cross-User Exploit Attempt)
    // =========================================================================
    console.log('\n--- STEP 6: Cross-User Exploit Blockade ---');
    // Compute valid signature for the order
    const realPaymentId = `pay_test_${timestamp}`;
    const validSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderData.orderId}|${realPaymentId}`)
      .digest('hex');

    // User B attempts to claim User A's order
    const exploitRes = await fetch(`${baseUrl}/api/v1/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`, // Attacker token
      },
      body: JSON.stringify({
        razorpay_order_id: orderData.orderId,
        razorpay_payment_id: realPaymentId,
        razorpay_signature: validSignature,
      }),
    });

    const exploitData = await exploitRes.json();
    console.log('[STEP 6] Cross-user exploit response:', exploitData);

    if (exploitRes.status !== 403) {
      throw new Error(`Expected HTTP 403 Forbidden for cross-user attack, got ${exploitRes.status}`);
    }
    console.log('[STEP 6] PASSED: Identity Pinning blocked cross-user payment hijacking with HTTP 403.');

    // =========================================================================
    // STEP 7: Legitimate Cryptographic Signature Verification & Confirmation
    // =========================================================================
    console.log('\n--- STEP 7: Legitimate Payment Verification & Confirmation ---');
    const legitVerifyRes = await fetch(`${baseUrl}/api/v1/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`, // Legitimate owner
      },
      body: JSON.stringify({
        razorpay_order_id: orderData.orderId,
        razorpay_payment_id: realPaymentId,
        razorpay_signature: validSignature,
        paymentMethod: 'UPI',
      }),
    });

    const legitVerifyData = await legitVerifyRes.json();
    console.log('[STEP 7] Legitimate verification response:', legitVerifyData);

    if (!legitVerifyRes.ok || !legitVerifyData.success) {
      throw new Error(`Payment verification failed: ${JSON.stringify(legitVerifyData)}`);
    }

    // Verify DB update
    const dbPaymentConfirmed = await paymentRepository.findByOrderId(orderData.orderId);
    if (!dbPaymentConfirmed) throw new Error('Payment record disappeared');
    if (dbPaymentConfirmed.status !== 'CONFIRMED') {
      throw new Error(`Expected status CONFIRMED, got ${dbPaymentConfirmed.status}`);
    }
    if (dbPaymentConfirmed.transactionId !== realPaymentId) {
      throw new Error(`Expected transactionId ${realPaymentId}, got ${dbPaymentConfirmed.transactionId}`);
    }
    if (!dbPaymentConfirmed.paidAt) {
      throw new Error('paidAt timestamp was not recorded in database');
    }

    // Verify user sellerOnboarded flag was updated
    const updatedUserA = await userRepository.findById(userA.id);
    if (!updatedUserA.sellerOnboarded) {
      throw new Error('User sellerOnboarded flag was not set to true');
    }

    console.log('[STEP 7] PASSED: Payment cryptographically verified, database status transitioned to CONFIRMED, seller onboarded.');

    // =========================================================================
    // STEP 8: Idempotency Protection (Replay Attack Check)
    // =========================================================================
    console.log('\n--- STEP 8: Idempotency & Replay Protection ---');
    const replayRes = await fetch(`${baseUrl}/api/v1/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        razorpay_order_id: orderData.orderId,
        razorpay_payment_id: realPaymentId,
        razorpay_signature: validSignature,
      }),
    });

    const replayData = await replayRes.json();
    console.log('[STEP 8] Replay response:', replayData);

    if (replayRes.status !== 200 || !replayData.success) {
      throw new Error(`Replay request failed: ${JSON.stringify(replayData)}`);
    }
    console.log('[STEP 8] PASSED: Idempotent replay handled cleanly without error.');

    // =========================================================================
    // STEP 9: Replay Attack Defense (HTTP 409 Conflict on Reused Payment ID)
    // =========================================================================
    console.log('\n--- STEP 9: Replay Attack Defense (HTTP 409 Conflict) ---');
    // Seller B creates a fresh legitimate order
    const orderBRes = await fetch(`${baseUrl}/api/v1/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({ planId: 'SELLER_ANNUAL' }),
    });
    const orderBData = await orderBRes.json();
    console.log('[STEP 9] Seller B order created:', orderBData.orderId);

    // Compute signature with Seller B's order ID but reusing Seller A's payment ID
    const stolenPaymentId = realPaymentId;
    const stolenSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderBData.orderId}|${stolenPaymentId}`)
      .digest('hex');

    const replayAttemptRes = await fetch(`${baseUrl}/api/v1/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({
        razorpay_order_id: orderBData.orderId,
        razorpay_payment_id: stolenPaymentId,
        razorpay_signature: stolenSignature,
      }),
    });

    const replayAttemptData = await replayAttemptRes.json();
    console.log('[STEP 9] Replay attempt response:', replayAttemptData);

    if (replayAttemptRes.status !== 409 || replayAttemptData.code !== 'PAYMENT_ALREADY_USED') {
      throw new Error(`Expected HTTP 409 PAYMENT_ALREADY_USED, got ${replayAttemptRes.status} (${JSON.stringify(replayAttemptData)})`);
    }
    console.log('[STEP 9] PASSED: Replay attack blocked with HTTP 409 Conflict (PAYMENT_ALREADY_USED).');

    // =========================================================================
    // STEP 10: Razorpay Webhook Event Auto-Confirmation (Zero Browser Reliance)
    // =========================================================================
    console.log('\n--- STEP 10: Server-to-Server Razorpay Webhook Auto-Activation ---');
    // Seller B's order (orderBData.orderId) is still in CREATED status
    const webhookPaymentId = `pay_hook_${Date.now()}`;
    const webhookPayload = JSON.stringify({
      entity: 'event',
      account_id: 'acc_test_123',
      event: 'payment.captured',
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: webhookPaymentId,
            order_id: orderBData.orderId,
            amount: 36500,
            status: 'captured',
            method: 'upi',
          },
        },
      },
    });

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    const webhookSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(webhookPayload)
      .digest('hex');

    const webhookRes = await fetch(`${baseUrl}/api/v1/payments/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': webhookSignature,
      },
      body: webhookPayload,
    });

    const webhookData = await webhookRes.json();
    console.log('[STEP 10] Webhook response:', webhookData);

    if (!webhookRes.ok || !webhookData.success) {
      throw new Error(`Webhook processing failed: ${JSON.stringify(webhookData)}`);
    }

    // Verify Seller B's order was auto-confirmed in Supabase DB via Webhook
    const dbOrderB = await paymentRepository.findByOrderId(orderBData.orderId);
    if (!dbOrderB || dbOrderB.status !== 'CONFIRMED' || dbOrderB.transactionId !== webhookPaymentId) {
      throw new Error(`Order B was not auto-confirmed by webhook! status: ${dbOrderB?.status}`);
    }

    // Verify Seller B user was auto-onboarded in users table
    const updatedUserB = await userRepository.findById(userB.id);
    if (!updatedUserB.sellerOnboarded) {
      throw new Error('Seller B sellerOnboarded flag was not set to true via webhook');
    }
    console.log('[STEP 10] PASSED: Webhook auto-activated seller account directly from Razorpay without browser interaction.');

    console.log('\n=============================================================');
    console.log('[ALL TESTS PASSED] Complete 10-step payment pipeline verified!');
    console.log('=============================================================\n');
  } finally {
    await stopServer();
  }
}

runRazorpayIntegrationTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[TEST FAILURE]:', err);
    process.exit(1);
  });

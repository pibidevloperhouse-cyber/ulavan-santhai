import crypto from 'node:crypto';

/**
 * Cryptographic Security Utility Layer
 * Provides constant-time, side-channel attack resistant signature validation.
 */

/**
 * Perform strict, timing-safe verification of HMAC-SHA256 signatures.
 *
 * Security Guarantees:
 * 1. Rejects missing or empty secrets immediately to prevent forging HMACs against
 *    unconfigured or empty keys.
 * 2. Neutralizes length leakage side-channels. Node.js `crypto.timingSafeEqual`
 *    requires both buffers to have the exact same length, otherwise it throws a RangeError.
 *    If an application checks `if (bufA.length !== bufB.length) return false;`, an attacker
 *    can measure response timing differences to deduce the expected signature length.
 *    Pre-hashing both inputs with SHA-256 guarantees two exactly 32-byte buffers, ensuring that
 *    `crypto.timingSafeEqual` executes in strict mathematical constant time across all inputs.
 *
 * @param {string|Buffer} payload - The message or raw body that was signed
 * @param {string} signature - The hexadecimal signature provided by the client or webhook
 * @param {string} secret - The cryptographic secret key
 * @returns {boolean} True if signature is cryptographically valid and authentic, false otherwise
 */
export const timingSafeVerifyHmacSha256 = (payload, signature, secret) => {
  if (!secret || typeof secret !== 'string' || secret.trim().length === 0) {
    throw new Error('[SECURITY FATAL] Cryptographic secret key is missing or invalid.');
  }

  if (!payload || !signature || typeof signature !== 'string') {
    return false;
  }

  try {
    // 1. Calculate authoritative HMAC-SHA256 hex digest using server secret
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    // 2. Pre-hash both digests using SHA-256 to produce fixed 32-byte buffers.
    // This neutralizes buffer length discrepancy leakage while ensuring constant-time comparison.
    const expectedHash = crypto
      .createHash('sha256')
      .update(Buffer.from(expectedSignature, 'utf8'))
      .digest();

    const providedHash = crypto
      .createHash('sha256')
      .update(Buffer.from(signature.trim(), 'utf8'))
      .digest();

    return crypto.timingSafeEqual(expectedHash, providedHash);
  } catch (err) {
    return false;
  }
};

/**
 * Verify Razorpay payment signature from client checkout modal
 * Expected payload: `${orderId}|${paymentId}`
 *
 * @param {object} params
 * @param {string} params.orderId
 * @param {string} params.paymentId
 * @param {string} params.signature
 * @param {string} params.secret
 * @returns {boolean} True if signature matches authentic HMAC-SHA256 digest
 */
export const verifyRazorpayPaymentSignature = ({ orderId, paymentId, signature, secret }) => {
  if (!orderId || !paymentId || !signature) {
    return false;
  }
  const payload = `${orderId}|${paymentId}`;
  return timingSafeVerifyHmacSha256(payload, signature, secret);
};

/**
 * Verify Razorpay webhook signature from server-to-server dispatch
 *
 * @param {object} params
 * @param {Buffer|string} params.rawBody
 * @param {string} params.signature
 * @param {string} params.secret
 * @returns {boolean} True if webhook signature matches authentic HMAC-SHA256 digest
 */
export const verifyRazorpayWebhookSignature = ({ rawBody, signature, secret }) => {
  if (!rawBody || !signature) {
    return false;
  }
  return timingSafeVerifyHmacSha256(rawBody, signature, secret);
};

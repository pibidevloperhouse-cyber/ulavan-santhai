import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  console.warn('[RAZORPAY WARNING] Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in environment.');
} else {
  console.log(`[RAZORPAY] Initialized payment client with Key ID prefix: ${keyId.substring(0, 8)}...`);
}

export const razorpayClient = new Razorpay({
  key_id: keyId || 'rzp_test_placeholder',
  key_secret: keySecret || 'rzp_secret_placeholder',
});

/**
 * Returns the public Razorpay Key ID for client modal initialization
 * @returns {string}
 */
export const getRazorpayKeyId = () => {
  return process.env.RAZORPAY_KEY_ID || '';
};

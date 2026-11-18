import { eq, desc } from 'drizzle-orm';
import { db } from '../config/db.js';
import { payments } from '../models/schema.js';

/**
 * Repository: Payments Data Access Layer
 */

/**
 * Insert a newly initiated payment order
 * @param {object} paymentData
 * @returns {Promise<object>}
 */
export const createPaymentRecord = async (paymentData) => {
  const [created] = await db
    .insert(payments)
    .values({
      ...paymentData,
      status: paymentData.status || 'CREATED',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  return created;
};

/**
 * Find payment record by Razorpay order ID
 * @param {string} orderId
 * @returns {Promise<object|null>}
 */
export const findByOrderId = async (orderId) => {
  if (!orderId) return null;
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.orderId, orderId))
    .limit(1);
  return payment || null;
};

/**
 * Find payment record by internal payment primary key ID
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export const findById = async (id) => {
  if (!id) return null;
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.id, id))
    .limit(1);
  return payment || null;
};

/**
 * Find payment record by transaction ID (Razorpay payment ID)
 * @param {string} transactionId
 * @returns {Promise<object|null>}
 */
export const findByTransactionId = async (transactionId) => {
  if (!transactionId) return null;
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.transactionId, transactionId))
    .limit(1);
  return payment || null;
};

/**
 * Find all payments for a given user ordered by creation date descending
 * @param {string} userId
 * @returns {Promise<Array<object>>}
 */
export const findByUserId = async (userId) => {
  return await db
    .select()
    .from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(desc(payments.createdAt));
};

/**
 * Transition payment status to CONFIRMED upon successful signature verification
 * @param {string} orderId
 * @param {object} updateData
 * @returns {Promise<object>}
 */
export const markPaymentConfirmed = async (orderId, { transactionId, signature, paymentMethod }) => {
  const now = new Date();
  const [updated] = await db
    .update(payments)
    .set({
      transactionId,
      signature: signature || null,
      paymentMethod: paymentMethod || 'UPI',
      status: 'CONFIRMED',
      paidAt: now,
      updatedAt: now,
    })
    .where(eq(payments.orderId, orderId))
    .returning();
  return updated;
};

/**
 * Mark payment as failed
 * @param {string} orderId
 * @param {object} failureData
 * @returns {Promise<object>}
 */
export const markPaymentFailed = async (orderId, { failureReason } = {}) => {
  const now = new Date();
  const [updated] = await db
    .update(payments)
    .set({
      status: 'FAILED',
      updatedAt: now,
    })
    .where(eq(payments.orderId, orderId))
    .returning();
  return updated;
};

/**
 * Backward-compatible insert or update by transaction ID
 */
export const create = async (paymentData) => {
  const [created] = await db
    .insert(payments)
    .values({
      ...paymentData,
      paidAt: paymentData.paidAt || new Date(),
    })
    .onConflictDoUpdate({
      target: payments.transactionId,
      set: {
        ...paymentData,
        paidAt: paymentData.paidAt || new Date(),
        updatedAt: new Date(),
      },
    })
    .returning();
  return created;
};

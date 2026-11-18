import { eq, and, desc } from 'drizzle-orm';
import { db } from '../config/db.js';
import { otpVerifications } from '../models/schema.js';

/**
 * Repository: OTP Verifications Data Access Layer
 */

/**
 * Create a new OTP verification record
 * @param {object} data
 * @returns {Promise<object>}
 */
export const create = async (data) => {
  const [created] = await db
    .insert(otpVerifications)
    .values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  return created;
};

/**
 * Find the latest active (PENDING) OTP record for a given email
 * @param {string} email
 * @param {string} [otpType='EMAIL_VERIFICATION']
 * @returns {Promise<object|null>}
 */
export const findActiveByEmail = async (email, otpType = 'EMAIL_VERIFICATION') => {
  const [record] = await db
    .select()
    .from(otpVerifications)
    .where(
      and(
        eq(otpVerifications.email, email.trim().toLowerCase()),
        eq(otpVerifications.otpType, otpType),
        eq(otpVerifications.status, 'PENDING')
      )
    )
    .orderBy(desc(otpVerifications.createdAt))
    .limit(1);

  return record || null;
};

/**
 * Find the latest active (PENDING) OTP record for a given user ID
 * @param {string} userId
 * @param {string} [otpType='EMAIL_VERIFICATION']
 * @returns {Promise<object|null>}
 */
export const findActiveByUserId = async (userId, otpType = 'EMAIL_VERIFICATION') => {
  const [record] = await db
    .select()
    .from(otpVerifications)
    .where(
      and(
        eq(otpVerifications.userId, userId),
        eq(otpVerifications.otpType, otpType),
        eq(otpVerifications.status, 'PENDING')
      )
    )
    .orderBy(desc(otpVerifications.createdAt))
    .limit(1);

  return record || null;
};

/**
 * Increment resend attempt count and refresh OTP hash & expiration
 * @param {string} id
 * @param {string} newOtpHash
 * @param {Date} newExpiresAt
 * @param {number} nextAttemptsCount
 * @returns {Promise<object>}
 */
export const updateResendAttempt = async (id, newOtpHash, newExpiresAt, nextAttemptsCount) => {
  const now = new Date();
  const [updated] = await db
    .update(otpVerifications)
    .set({
      otpHash: newOtpHash,
      resendAttempts: nextAttemptsCount,
      verificationAttempts: 0,
      expiresAt: newExpiresAt,
      lastResentAt: now,
      updatedAt: now,
    })
    .where(eq(otpVerifications.id, id))
    .returning();

  return updated;
};

/**
 * Record a failed verification attempt and update timestamp
 * @param {string} id
 * @param {number} nextAttemptsCount
 * @returns {Promise<object>}
 */
export const updateVerificationAttempt = async (id, nextAttemptsCount) => {
  const now = new Date();
  const [updated] = await db
    .update(otpVerifications)
    .set({
      verificationAttempts: nextAttemptsCount,
      lastAttemptAt: now,
      updatedAt: now,
    })
    .where(eq(otpVerifications.id, id))
    .returning();

  return updated;
};

/**
 * Reset verification attempt counter to 0
 * @param {string} id
 * @returns {Promise<object>}
 */
export const resetVerificationAttempts = async (id) => {
  const [updated] = await db
    .update(otpVerifications)
    .set({
      verificationAttempts: 0,
      updatedAt: new Date(),
    })
    .where(eq(otpVerifications.id, id))
    .returning();

  return updated;
};

/**
 * Mark an OTP record as VERIFIED
 * @param {string} id
 * @returns {Promise<object>}
 */
export const markAsVerified = async (id) => {
  const now = new Date();
  const [updated] = await db
    .update(otpVerifications)
    .set({
      status: 'VERIFIED',
      updatedAt: now,
    })
    .where(eq(otpVerifications.id, id))
    .returning();

  return updated;
};

/**
 * Mark any previous pending OTP records as EXPIRED
 * @param {string} userId
 * @param {string} [otpType='EMAIL_VERIFICATION']
 * @returns {Promise<void>}
 */
export const markPreviousPendingAsExpired = async (userId, otpType = 'EMAIL_VERIFICATION') => {
  await db
    .update(otpVerifications)
    .set({
      status: 'EXPIRED',
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(otpVerifications.userId, userId),
        eq(otpVerifications.otpType, otpType),
        eq(otpVerifications.status, 'PENDING')
      )
    );
};

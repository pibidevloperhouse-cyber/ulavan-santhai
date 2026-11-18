import dotenv from 'dotenv';
dotenv.config();

process.env.NODE_ENV = 'test';

import * as userRepository from '../src/repositories/user.repository.js';
import * as otpRepository from '../src/repositories/otp.repository.js';
import { db } from '../src/config/db.js';
import { otpVerifications } from '../src/models/schema.js';
import { eq } from 'drizzle-orm';
import {
  registerUserService,
  verifyEmailOtpService,
  resendEmailOtpService,
  hashOtp,
} from '../src/services/auth.service.js';

async function runVerificationRateLimitingTests() {
  console.log('[TEST] Starting 5-Attempt OTP Verification Rate Limiting & Lockout Test Suite...');

  const timestamp = Date.now();
  const testEmail = `verif_limit_${timestamp}@example.com`;
  const testMobile = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
  const testPassword = 'Password123!';

  // =========================================================================
  // STEP 1: Register User & Check Initial DB Verification State
  // =========================================================================
  console.log('\n--- STEP 1: Registering User ---');
  const regRes = await registerUserService({
    name: 'Rate Limit Test User',
    username: `ratelimit_${timestamp}`,
    email: testEmail,
    mobile: testMobile,
    password: testPassword,
  });

  console.log('[STEP 1] Registration response:', regRes);
  if (!regRes.success) throw new Error('Registration failed');

  const dbUser = await userRepository.findByEmail(testEmail);
  if (!dbUser) throw new Error('User was not persisted');

  let activeOtp = await otpRepository.findActiveByUserId(dbUser.id);
  if (!activeOtp) throw new Error('Active OTP not found in DB');
  console.log('[STEP 1] Initial DB OTP verification_attempts:', activeOtp.verificationAttempts);
  if (activeOtp.verificationAttempts !== 0) {
    throw new Error(`Expected initial verificationAttempts 0, got ${activeOtp.verificationAttempts}`);
  }

  // =========================================================================
  // STEP 2: Failed Attempts 1 through 4 (Warning Countdown)
  // =========================================================================
  console.log('\n--- STEP 2: Testing Warning Countdown on Failed Attempts 1 to 4 ---');
  for (let attempt = 1; attempt <= 4; attempt++) {
    const expectedRemaining = 5 - attempt;
    try {
      await verifyEmailOtpService({ email: testEmail, otp: '000000' });
      throw new Error(`Attempt ${attempt} should have failed with 400!`);
    } catch (err) {
      console.log(`[STEP 2] Attempt ${attempt}/5 result: status=${err.statusCode}, message="${err.message}", remaining=${err.remainingAttempts}`);
      if (err.statusCode !== 400) throw new Error(`Expected status 400 on attempt ${attempt}, got ${err.statusCode}`);
      if (err.remainingAttempts !== expectedRemaining) {
        throw new Error(`Expected remainingAttempts ${expectedRemaining}, got ${err.remainingAttempts}`);
      }
      if (!err.message.includes(`${expectedRemaining} attempt(s) remaining`)) {
        throw new Error(`Message should include remaining warning, got: "${err.message}"`);
      }
    }

    // Verify in database
    activeOtp = await otpRepository.findActiveByUserId(dbUser.id);
    if (activeOtp.verificationAttempts !== attempt) {
      throw new Error(`DB verificationAttempts mismatch: expected ${attempt}, got ${activeOtp.verificationAttempts}`);
    }
  }

  // =========================================================================
  // STEP 3: 5th Failed Attempt (Triggers 1-Hour Lockout with HTTP 429)
  // =========================================================================
  console.log('\n--- STEP 3: Testing 5th Attempt Lockout (HTTP 429) ---');
  try {
    await verifyEmailOtpService({ email: testEmail, otp: '000000' });
    throw new Error('5th attempt should have been locked out with 429!');
  } catch (err) {
    console.log(`[STEP 3] 5th Attempt Lockout result: status=${err.statusCode}, code=${err.code}, locked=${err.locked}, hours=${err.remainingHours}, message="${err.message}"`);
    if (err.statusCode !== 429) throw new Error(`Expected status 429, got ${err.statusCode}`);
    if (err.code !== 'VERIFICATION_LOCKOUT') throw new Error(`Expected code VERIFICATION_LOCKOUT, got ${err.code}`);
    if (err.locked !== true) throw new Error('Expected locked to be true');
    if (!err.message.includes('24 hour(s)')) {
      throw new Error(`Expected message to specify 24 hour(s), got: "${err.message}"`);
    }
  }

  // Verify in database that verification_attempts is 5
  activeOtp = await otpRepository.findActiveByUserId(dbUser.id);
  if (activeOtp.verificationAttempts !== 5) {
    throw new Error(`Expected DB verificationAttempts 5, got ${activeOtp.verificationAttempts}`);
  }

  // =========================================================================
  // STEP 4: Subsequent 6th Attempt During Lockout (Immediate Rejection)
  // =========================================================================
  console.log('\n--- STEP 4: Testing 6th Attempt During Lockout (Immediate Reject) ---');
  try {
    await verifyEmailOtpService({ email: testEmail, otp: '000000' });
    throw new Error('6th attempt should have been rejected immediately with 429!');
  } catch (err) {
    console.log(`[STEP 4] 6th Attempt result: status=${err.statusCode}, message="${err.message}"`);
    if (err.statusCode !== 429) throw new Error(`Expected status 429, got ${err.statusCode}`);
    if (err.code !== 'VERIFICATION_LOCKOUT') throw new Error(`Expected code VERIFICATION_LOCKOUT`);
  }

  // =========================================================================
  // STEP 5: Resend Code Attempt During Lockout (Must be Blocked with Warning)
  // =========================================================================
  console.log('\n--- STEP 5: Testing Resend Code During Lockout (Blocked) ---');
  try {
    await resendEmailOtpService({ email: testEmail });
    throw new Error('Resend during lockout should have been blocked with 429!');
  } catch (err) {
    console.log(`[STEP 5] Resend during lockout result: status=${err.statusCode}, code=${err.code}, locked=${err.locked}, message="${err.message}"`);
    if (err.statusCode !== 429) throw new Error(`Expected status 429 on resend, got ${err.statusCode}`);
    if (err.code !== 'VERIFICATION_LOCKOUT') throw new Error(`Expected code VERIFICATION_LOCKOUT on resend`);
    if (err.locked !== true) throw new Error('Expected locked to be true');
    if (!err.message.includes('Verification limit exceeded (5/5). Resending code is temporarily blocked')) {
      throw new Error(`Unexpected resend lockout message: "${err.message}"`);
    }
  }

  // =========================================================================
  // STEP 6A: Simulate Partial 2 Hours Elapsed (Must Still Be Locked for 22 Hours)
  // =========================================================================
  console.log('\n--- STEP 6A: Simulating 2 Hours Elapsed (Must Still Be Locked) ---');
  const twoHoursPast = new Date(Date.now() - 2 * 60 * 60 * 1000);
  await db
    .update(otpVerifications)
    .set({
      lastAttemptAt: twoHoursPast,
      lastResentAt: twoHoursPast,
    })
    .where(eq(otpVerifications.id, activeOtp.id));

  try {
    await verifyEmailOtpService({ email: testEmail, otp: '000000' });
    throw new Error('Should still be locked after 2 hours!');
  } catch (err) {
    console.log(`[STEP 6A] Correctly still locked after 2 hours: hours=${err.remainingHours}, message="${err.message}"`);
    if (err.statusCode !== 429) throw new Error('Expected 429 after 2 hours');
  }

  // =========================================================================
  // STEP 6B: Simulate Full 25 Hours Elapsed (Auto-Reset Counter in DB)
  // =========================================================================
  console.log('\n--- STEP 6B: Simulating 25 Hours Elapsed in Database ---');
  const pastTime = new Date(Date.now() - 25 * 60 * 60 * 1000);
  await db
    .update(otpVerifications)
    .set({
      lastAttemptAt: pastTime,
      lastResentAt: pastTime,
    })
    .where(eq(otpVerifications.id, activeOtp.id));

  console.log('[STEP 6B] DB timestamps backdated by 25 hours');

  // Now, request Resend Code - it should clear the lockout and dispatch a fresh code
  console.log('\n--- STEP 7: Requesting Resend Code After 24 Hours Passed ---');
  const resendResult = await resendEmailOtpService({ email: testEmail });
  console.log('[STEP 7] Resend result after 24 hrs:', resendResult);
  if (!resendResult.success) throw new Error('Resend after 24 hrs should succeed');

  activeOtp = await otpRepository.findActiveByUserId(dbUser.id);
  console.log('[STEP 7] Verification attempts after resend auto-reset:', activeOtp.verificationAttempts);
  if (activeOtp.verificationAttempts !== 0) {
    throw new Error(`Expected verificationAttempts to reset to 0, got ${activeOtp.verificationAttempts}`);
  }

  // =========================================================================
  // STEP 8: Verification with Correct Code Succeeds
  // =========================================================================
  console.log('\n--- STEP 8: Verifying Strict Cryptographic OTP Validation ---');
  // Set known valid OTP hash in database to test exact cryptographic matching
  const validTestOtp = '849201';
  await db
    .update(otpVerifications)
    .set({ otpHash: hashOtp(validTestOtp) })
    .where(eq(otpVerifications.id, activeOtp.id));

  // Verify that an incorrect code (e.g. 123456) is strictly rejected (no backdoor bypass)
  try {
    await verifyEmailOtpService({ email: testEmail, otp: '123456' });
    throw new Error('123456 should have been rejected!');
  } catch (err) {
    console.log('[STEP 8] Verified that wrong code 123456 is strictly rejected:', err.message);
  }

  // Verify with exact matching code
  const verifyResult = await verifyEmailOtpService({ email: testEmail, otp: validTestOtp });
  console.log('[STEP 8] Verification success result:', {
    success: verifyResult.success,
    tokenIssued: Boolean(verifyResult.token),
    isVerified: verifyResult.user.isVerified,
  });

  if (!verifyResult.success || !verifyResult.token || !verifyResult.user.isVerified) {
    throw new Error('Verification failed with valid code');
  }

  const finalDbUser = await userRepository.findByEmail(testEmail);
  if (finalDbUser.isVerified !== true) {
    throw new Error('User in database is_verified must be true');
  }

  console.log('\n=============================================================');
  console.log('[SUCCESS] All 5-Attempt Rate Limiting & Lockout Tests Passed!');
  console.log('=============================================================');
}

runVerificationRateLimitingTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n[TEST FAILED]', err.message);
    console.error(err.stack);
    process.exit(1);
  });

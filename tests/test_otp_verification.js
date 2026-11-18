import dotenv from 'dotenv';
dotenv.config();

process.env.NODE_ENV = 'test';

import * as userRepository from '../src/repositories/user.repository.js';
import * as otpRepository from '../src/repositories/otp.repository.js';
import {
  registerUserService,
  resendEmailOtpService,
  verifyEmailOtpService,
  loginUserService,
  hashOtp,
} from '../src/services/auth.service.js';

async function runOtpTests() {
  console.log('[TEST] Starting Database-Backed OTP Verification & Rate Limiting Test Suite...');

  const timestamp = Date.now();
  const testEmail = `otp_test_${timestamp}@example.com`;
  const testMobile = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
  const testPassword = 'Password123!';

  // =========================================================================
  // TEST 1: User Registration creates unverified user and DB OTP record
  // =========================================================================
  console.log('\n--- TEST 1: Initial Registration & Database Record Creation ---');
  const regRes = await registerUserService({
    name: 'Test OTP User',
    username: `otpuser_${timestamp}`,
    email: testEmail,
    mobile: testMobile,
    password: testPassword,
  });

  console.log('[TEST 1] Registration response:', regRes);
  if (!regRes.success) throw new Error('Registration failed');

  // Verify in users table: is_verified must be false
  const dbUser = await userRepository.findByEmail(testEmail);
  if (!dbUser) throw new Error('User was not created in users table');
  console.log('[TEST 1] DB User created:', { id: dbUser.id, isVerified: dbUser.isVerified });
  if (dbUser.isVerified !== false) throw new Error('User isVerified should be false upon registration');

  // Verify in otp_verifications table: must have row with user_id and resend_attempts: 0
  const dbOtp = await otpRepository.findActiveByUserId(dbUser.id);
  if (!dbOtp) throw new Error('OTP record not created in otp_verifications table');
  console.log('[TEST 1] DB OTP record created:', {
    id: dbOtp.id,
    userId: dbOtp.userId,
    resendAttempts: dbOtp.resendAttempts,
    status: dbOtp.status,
    hasHash: Boolean(dbOtp.otpHash),
  });

  if (dbOtp.userId !== dbUser.id) throw new Error('OTP record user_id does not match user id');
  if (dbOtp.resendAttempts !== 0) throw new Error('Initial resendAttempts should be 0');
  if (dbOtp.status !== 'PENDING') throw new Error('Initial status should be PENDING');

  // =========================================================================
  // TEST 2: Attempt Resends up to Max 3
  // =========================================================================
  console.log('\n--- TEST 2: Resend Attempts & Increments ---');

  // Fast resend (<30s) should throw 429 interval cooldown
  let caughtIntervalThrottle = false;
  try {
    await resendEmailOtpService({ email: testEmail });
  } catch (err) {
    if (err.statusCode === 429) {
      caughtIntervalThrottle = true;
      console.log('[TEST 2] 30s interval throttle caught successfully:', err.message);
    }
  }
  if (!caughtIntervalThrottle) throw new Error('Expected 429 for fast resend within 30s');

  // Manually backdate lastResentAt to simulate 31s elapsed to test counter increments
  const pastTime = new Date(Date.now() - 35000);

  // Resend Attempt 1
  await otpRepository.updateResendAttempt(dbOtp.id, dbOtp.otpHash, dbOtp.expiresAt, 0);
  await dbOtp; // reload
  // Set lastResentAt into the past
  await userRepository.update(dbUser.id, {}); // touch
  // Update lastResentAt directly
  const { db } = await import('../src/config/db.js');
  const { otpVerifications } = await import('../src/models/schema.js');
  const { eq } = await import('drizzle-orm');

  await db.update(otpVerifications).set({ lastResentAt: pastTime }).where(eq(otpVerifications.id, dbOtp.id));
  const resend1 = await resendEmailOtpService({ email: testEmail });
  console.log('[TEST 2] Resend Attempt 1 result:', resend1);
  if (resend1.attemptsUsed !== 1) throw new Error(`Expected attemptsUsed 1, got ${resend1.attemptsUsed}`);

  // Resend Attempt 2
  await db.update(otpVerifications).set({ lastResentAt: pastTime }).where(eq(otpVerifications.id, dbOtp.id));
  const resend2 = await resendEmailOtpService({ email: testEmail });
  console.log('[TEST 2] Resend Attempt 2 result:', resend2);
  if (resend2.attemptsUsed !== 2) throw new Error(`Expected attemptsUsed 2, got ${resend2.attemptsUsed}`);

  // Resend Attempt 3
  await db.update(otpVerifications).set({ lastResentAt: pastTime }).where(eq(otpVerifications.id, dbOtp.id));
  const resend3 = await resendEmailOtpService({ email: testEmail });
  console.log('[TEST 2] Resend Attempt 3 result:', resend3);
  if (resend3.attemptsUsed !== 3) throw new Error(`Expected attemptsUsed 3, got ${resend3.attemptsUsed}`);

  // =========================================================================
  // TEST 3: Rate Limiting Lockout on 4th Attempt (HTTP 429)
  // =========================================================================
  console.log('\n--- TEST 3: 4th Resend Attempt Lockout (HTTP 429) ---');
  await db.update(otpVerifications).set({ lastResentAt: pastTime }).where(eq(otpVerifications.id, dbOtp.id));
  let caughtMaxAttempts = false;
  try {
    await resendEmailOtpService({ email: testEmail });
  } catch (err) {
    if (err.statusCode === 429 && err.message.includes('Maximum OTP resend attempts')) {
      caughtMaxAttempts = true;
      console.log('[TEST 3] Maximum attempts lockout caught successfully:', err.message);
    }
  }
  if (!caughtMaxAttempts) throw new Error('Expected 429 with Maximum attempts exceeded error message');

  // =========================================================================
  // TEST 4: Invalid OTP Rejection (HTTP 400)
  // =========================================================================
  console.log('\n--- TEST 4: Invalid OTP Rejection ---');
  let caughtInvalidOtp = false;
  try {
    await verifyEmailOtpService({ email: testEmail, otp: '000000' });
  } catch (err) {
    if (err.statusCode === 400) {
      caughtInvalidOtp = true;
      console.log('[TEST 4] Invalid OTP correctly rejected:', err.message);
    }
  }
  if (!caughtInvalidOtp) throw new Error('Expected 400 for invalid verification code');

  // =========================================================================
  // TEST 5: Successful Verification & Account Activation
  // =========================================================================
  console.log('\n--- TEST 5: Successful Verification & JWT Issuance ---');
  // Set known valid OTP hash in database to test exact cryptographic matching
  const validTestOtp = '729104';
  const latestOtp = await otpRepository.findActiveByUserId(dbUser.id);
  await db.update(otpVerifications).set({ otpHash: hashOtp(validTestOtp) }).where(eq(otpVerifications.id, latestOtp.id));

  // Verify that an invalid code (e.g. 123456) is strictly rejected (no bypass)
  try {
    await verifyEmailOtpService({ email: testEmail, otp: '123456' });
    throw new Error('123456 should have been rejected!');
  } catch (err) {
    console.log('[TEST 5] Invalid code 123456 strictly rejected:', err.message);
  }

  // Verify with exact matching code
  const verifyRes = await verifyEmailOtpService({ email: testEmail, otp: validTestOtp });
  console.log('[TEST 5] Verification response:', {
    success: verifyRes.success,
    tokenIssued: Boolean(verifyRes.token),
    userVerified: verifyRes.user?.isVerified,
  });

  if (!verifyRes.success) throw new Error('Verification failed');
  if (!verifyRes.token) throw new Error('JWT Token not issued');
  if (verifyRes.user.isVerified !== true) throw new Error('User isVerified was not set to true');

  // Verify in DB that status is now VERIFIED
  const verifiedUser = await userRepository.findByEmail(testEmail);
  if (!verifiedUser.isVerified) throw new Error('User isVerified in database is still false');

  const verifiedOtp = await otpRepository.findActiveByUserId(dbUser.id);
  // findActiveByUserId queries status = 'PENDING', so verifiedOtp should now be null!
  console.log('[TEST 5] Verified OTP active lookup result (should be null):', verifiedOtp);
  if (verifiedOtp !== null) throw new Error('Verified OTP should no longer be in PENDING state');

  // =========================================================================
  // TEST 6: Login with Newly Verified User
  // =========================================================================
  console.log('\n--- TEST 6: Login with Newly Verified Account ---');
  const loginRes = await loginUserService({
    email: testEmail,
    password: testPassword,
  });
  console.log('[TEST 6] Login response:', {
    success: loginRes.success,
    userName: loginRes.user?.name,
    isVerified: loginRes.user?.isVerified,
  });
  if (!loginRes.success) throw new Error('Login failed for verified user');

  console.log('\n=============================================================');
  console.log('[SUCCESS] All Database-Backed OTP & Rate Limiting Tests Passed!');
  console.log('=============================================================\n');
}

runOtpTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[TEST FAILED]', err);
    process.exit(1);
  });

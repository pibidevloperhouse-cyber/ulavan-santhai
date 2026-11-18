import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as userRepository from '../repositories/user.repository.js';
import * as otpRepository from '../repositories/otp.repository.js';
import { sendVerificationEmail } from './email.service.js';

// Configuration constants
const BCRYPT_ROUNDS = 10;
const OTP_EXPIRY_MS = 10 * 60 * 1000;              // 10 minutes TTL
const RESEND_INTERVAL_MS = 30 * 1000;             // 30 seconds interval between resends
const MAX_RESEND_ATTEMPTS = 3;                    // Maximum 3 resend attempts allowed
const RATE_LIMIT_LOCKOUT_MS = 24 * 60 * 60 * 1000; // 24 hours cooldown window (86,400,000 ms)
const MAX_VERIFICATION_ATTEMPTS = 5;              // Maximum 5 failed OTP verification attempts
const VERIFICATION_LOCKOUT_MS = 24 * 60 * 60 * 1000; // 24 hours verification lockout window (86,400,000 ms)
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('[SECURITY FATAL] JWT_SECRET is not configured in environment variables.');
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^\d{10}$/;

/**
 * Computes a SHA-256 hash of the plain OTP string for database storage
 * @param {string|number} rawOtp
 * @returns {string} SHA-256 hex string
 */
export const hashOtp = (rawOtp) => {
  return crypto.createHash('sha256').update(String(rawOtp).trim()).digest('hex');
};

/**
 * Generates a cryptographically secure 6-digit random numeric code (100000 - 999999)
 * @returns {string} 6-digit OTP string
 */
export const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Normalizes email address
 * @param {string} email
 * @returns {string}
 */
export const normalizeEmail = (email) => {
  return String(email || '').trim().toLowerCase();
};

/**
 * Normalizes mobile number (extracts 10 digits)
 * @param {string|number} mobile
 * @returns {string}
 */
export const normalizeMobile = (mobile) => {
  const cleaned = String(mobile || '').replace(/\D/g, '');
  return cleaned.length >= 10 ? cleaned.slice(-10) : cleaned;
};

/**
 * Generates a high-security signed JWT token for the user session
 * Strictly excludes any passwords, internal salts, or sensitive data.
 * @param {object|string} user - User record object or userId string
 * @returns {string} Standard signed JSON Web Token (JWT)
 */
export const generateAuthToken = (user) => {
  const payload = typeof user === 'string'
    ? { id: user }
    : {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isVerified: Boolean(user.isVerified),
        sellerOnboarded: Boolean(user.sellerOnboarded),
        buyerOnboarded: Boolean(user.buyerOnboarded),
        onboarded: Boolean(user.onboarded),
      };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Service: Register User & Dispatch Verification OTP
 * Creates user in database with isVerified = false, and creates persistent OTP record.
 * @param {object} input
 * @param {string} input.name
 * @param {string} [input.username]
 * @param {string} input.email
 * @param {string} input.mobile
 * @param {string} input.password
 * @returns {Promise<{ success: boolean, message: string, email: string, userId: string }>}
 */
export const registerUserService = async ({ name, username, email, mobile, password } = {}) => {
  if (!name || !email || !mobile || !password) {
    const error = new Error('name, email, mobile, and password are required fields.');
    error.statusCode = 400;
    throw error;
  }

  const cleanName = String(name).trim();
  const cleanUsername = String(username || name).trim();
  const cleanEmail = normalizeEmail(email);
  const cleanMobile = normalizeMobile(mobile);
  const rawPassword = String(password);

  if (cleanName.length < 2) {
    const error = new Error('Name must be at least 2 characters long.');
    error.statusCode = 400;
    throw error;
  }

  if (!EMAIL_REGEX.test(cleanEmail)) {
    const error = new Error('Please provide a valid email address.');
    error.statusCode = 400;
    throw error;
  }

  if (!MOBILE_REGEX.test(cleanMobile)) {
    const error = new Error('Mobile number must contain exactly 10 numeric digits.');
    error.statusCode = 400;
    throw error;
  }

  if (rawPassword.length < 8) {
    const error = new Error('Password must be at least 8 characters long.');
    error.statusCode = 400;
    throw error;
  }

  // Duplicate Check
  const existingUser = await userRepository.findByEmailOrMobile(cleanEmail, cleanMobile);
  const passwordHash = await bcrypt.hash(rawPassword, BCRYPT_ROUNDS);
  const rawOtp = generateOtp();
  const otpHash = hashOtp(rawOtp);
  const now = new Date();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  let targetUserId;

  if (existingUser) {
    if (existingUser.isVerified) {
      const conflictField = existingUser.email === cleanEmail ? 'email' : 'phone number';
      const error = new Error(`Account with this ${conflictField} already exists.`);
      error.statusCode = 409;
      throw error;
    }

    // Existing but UNVERIFIED user attempting re-registration
    targetUserId = existingUser.id;

    // Check rate limit on active OTP
    const activeOtp = await otpRepository.findActiveByUserId(targetUserId);
    if (activeOtp) {
      const lastAttemptTime = new Date(activeOtp.lastAttemptAt || activeOtp.createdAt).getTime();
      const timeSinceLastAttempt = Date.now() - lastAttemptTime;
      if (activeOtp.verificationAttempts >= MAX_VERIFICATION_ATTEMPTS && timeSinceLastAttempt < VERIFICATION_LOCKOUT_MS) {
        const remainingMinutes = Math.ceil((VERIFICATION_LOCKOUT_MS - timeSinceLastAttempt) / (60 * 1000));
        const remainingHours = Math.ceil(remainingMinutes / 60);
        const timeText = remainingMinutes > 60 ? `${remainingHours} hour(s)` : `${remainingMinutes} minute(s)`;
        const error = new Error(`Verification limit exceeded (5/5). Account is temporarily locked. Please wait ${timeText} before trying again.`);
        error.statusCode = 429;
        error.code = 'VERIFICATION_LOCKOUT';
        error.remainingMinutes = remainingMinutes;
        error.remainingHours = remainingHours;
        error.locked = true;
        throw error;
      }

      const lastResentTime = new Date(activeOtp.lastResentAt).getTime();
      const timeSinceLast = Date.now() - lastResentTime;

      if (activeOtp.resendAttempts >= MAX_RESEND_ATTEMPTS && timeSinceLast < RATE_LIMIT_LOCKOUT_MS) {
        const remainingMinutes = Math.ceil((RATE_LIMIT_LOCKOUT_MS - timeSinceLast) / (60 * 1000));
        const remainingHours = Math.ceil(remainingMinutes / 60);
        const timeText = remainingMinutes > 60 ? `${remainingHours} hour(s)` : `${remainingMinutes} minute(s)`;
        const error = new Error(`Maximum OTP attempts (${MAX_RESEND_ATTEMPTS}) reached. Please wait ${timeText} before trying again.`);
        error.statusCode = 429;
        error.remainingMinutes = remainingMinutes;
        error.remainingHours = remainingHours;
        throw error;
      }

      // Expire previous pending OTPs
      await otpRepository.markPreviousPendingAsExpired(targetUserId);
      const nextAttempts = timeSinceLast >= RATE_LIMIT_LOCKOUT_MS ? 0 : activeOtp.resendAttempts + 1;

      // Create fresh OTP linked to targetUserId
      const otpId = `otp_${crypto.randomBytes(8).toString('hex')}`;
      await otpRepository.create({
        id: otpId,
        userId: targetUserId,
        email: cleanEmail,
        otpHash,
        otpType: 'EMAIL_VERIFICATION',
        resendAttempts: nextAttempts,
        status: 'PENDING',
        expiresAt,
        lastResentAt: now,
      });
    } else {
      const otpId = `otp_${crypto.randomBytes(8).toString('hex')}`;
      await otpRepository.create({
        id: otpId,
        userId: targetUserId,
        email: cleanEmail,
        otpHash,
        otpType: 'EMAIL_VERIFICATION',
        resendAttempts: 0,
        status: 'PENDING',
        expiresAt,
        lastResentAt: now,
      });
    }

    // Update unverified user record with new password/name
    await userRepository.update(targetUserId, {
      name: cleanName,
      username: cleanUsername,
      mobile: cleanMobile,
      password: passwordHash,
      updatedAt: now,
    });
  } else {
    // New User: create in users table with isVerified = false
    targetUserId = `usr_${crypto.randomBytes(8).toString('hex')}`;
    const newUser = await userRepository.create({
      id: targetUserId,
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      mobile: cleanMobile,
      password: passwordHash,
      isVerified: false,
      role: 'USER',
      onboarded: false,
      sellerOnboarded: false,
      buyerOnboarded: false,
      createdAt: now,
      updatedAt: now,
    });

    if (!newUser) {
      const error = new Error('Failed to initialize user account.');
      error.statusCode = 500;
      throw error;
    }

    // Create initial OTP in otp_verifications table
    const otpId = `otp_${crypto.randomBytes(8).toString('hex')}`;
    await otpRepository.create({
      id: otpId,
      userId: targetUserId,
      email: cleanEmail,
      otpHash,
      otpType: 'EMAIL_VERIFICATION',
      resendAttempts: 0,
      status: 'PENDING',
      expiresAt,
      lastResentAt: now,
    });
  }

  // Dispatch Code via Email
  try {
    await sendVerificationEmail({
      to: cleanEmail,
      name: cleanName,
      otp: rawOtp,
      expiresInMinutes: 10,
    });
  } catch (mailError) {
    console.error(`[EMAIL DISPATCH FAILED] ${mailError.message}`);
    const error = new Error('Failed to deliver verification email. Please check your email address and try again.');
    error.statusCode = 500;
    throw error;
  }

  console.log(`[AUTH] Registration initiated. Database OTP generated for ${cleanEmail} (UserId: ${targetUserId})`);

  return {
    success: true,
    message: 'Registration initiated. Verification OTP sent to your email.',
    email: cleanEmail,
    userId: targetUserId,
  };
};

/**
 * Service: Verify 6-Digit OTP and Activate User in Database
 * Updates otp_verifications to VERIFIED and sets users.isVerified = true.
 * @param {object} input
 * @param {string} input.email
 * @param {string} input.otp
 * @returns {Promise<object>}
 */
export const verifyEmailOtpService = async ({ email, otp, code } = {}) => {
  const cleanEmail = normalizeEmail(email);
  const cleanOtp = String(otp || code || '').trim();

  if (!cleanEmail || !cleanOtp) {
    const error = new Error('Email and 6-digit OTP are required.');
    error.statusCode = 400;
    throw error;
  }

  const user = await userRepository.findByEmail(cleanEmail);
  if (!user) {
    const error = new Error('No pending registration found for this email. Please register first.');
    error.statusCode = 404;
    throw error;
  }

  if (user.isVerified) {
    const error = new Error('Account is already registered and verified. Please log in.');
    error.statusCode = 400;
    throw error;
  }

  const activeOtp = await otpRepository.findActiveByUserId(user.id);
  if (!activeOtp) {
    const error = new Error('No pending OTP found. Please request a new verification code.');
    error.statusCode = 404;
    throw error;
  }

  const now = Date.now();
  const lastAttemptTime = new Date(activeOtp.lastAttemptAt || activeOtp.createdAt).getTime();
  const timeSinceLastAttempt = now - lastAttemptTime;

  // 1. Check if user is currently locked out (5 failed verification attempts within 24 hours)
  if (activeOtp.verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
    if (timeSinceLastAttempt < VERIFICATION_LOCKOUT_MS) {
      const remainingMinutes = Math.ceil((VERIFICATION_LOCKOUT_MS - timeSinceLastAttempt) / (60 * 1000));
      const remainingHours = Math.ceil(remainingMinutes / 60);
      const timeText = remainingMinutes > 60 ? `${remainingHours} hour(s)` : `${remainingMinutes} minute(s)`;
      const error = new Error(`Maximum verification attempts (${MAX_VERIFICATION_ATTEMPTS}) reached. Please try again after ${timeText}.`);
      error.statusCode = 429;
      error.code = 'VERIFICATION_LOCKOUT';
      error.remainingMinutes = remainingMinutes;
      error.remainingHours = remainingHours;
      error.locked = true;
      throw error;
    } else {
      // 24 hours have elapsed: automatically reset verification attempts back to 0
      await otpRepository.resetVerificationAttempts(activeOtp.id);
      activeOtp.verificationAttempts = 0;
    }
  }

  // 2. Expiration check
  if (now > new Date(activeOtp.expiresAt).getTime()) {
    const error = new Error('OTP has expired. Please request a new code.');
    error.statusCode = 400;
    throw error;
  }

  // 3. Strict cryptographic SHA-256 hash comparison against database record
  const hashedInput = hashOtp(cleanOtp);
  const isMatch = activeOtp.otpHash === hashedInput;

  if (!isMatch) {
    const nextAttempts = (activeOtp.verificationAttempts || 0) + 1;
    await otpRepository.updateVerificationAttempt(activeOtp.id, nextAttempts);

    if (nextAttempts >= MAX_VERIFICATION_ATTEMPTS) {
      const error = new Error(`Maximum verification attempts (${MAX_VERIFICATION_ATTEMPTS}) reached. Please try again after 24 hour(s).`);
      error.statusCode = 429;
      error.code = 'VERIFICATION_LOCKOUT';
      error.remainingMinutes = 24 * 60;
      error.remainingHours = 24;
      error.locked = true;
      throw error;
    }

    const remaining = MAX_VERIFICATION_ATTEMPTS - nextAttempts;
    const error = new Error(`Invalid verification code. You have ${remaining} attempt(s) remaining.`);
    error.statusCode = 400;
    error.remainingAttempts = remaining;
    throw error;
  }

  // 1. Mark OTP record as verified
  await otpRepository.markAsVerified(activeOtp.id);

  // 2. Mark user as verified in database
  const updatedUser = await userRepository.updateVerificationStatus(user.id, true);

  console.log(`[AUTH] User verified & activated in DB: ${updatedUser.name} (${updatedUser.email})`);

  const token = generateAuthToken(updatedUser);

  return {
    success: true,
    message: 'Account registered and verified successfully.',
    token,
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      mobile: updatedUser.mobile,
      sellerOnboarded: Boolean(updatedUser.sellerOnboarded),
      buyerOnboarded: Boolean(updatedUser.buyerOnboarded),
      role: updatedUser.role,
      isVerified: true,
      onboarded: Boolean(updatedUser.onboarded),
    },
  };
};

/**
 * Service: Resend 6-Digit Email OTP with 3-Attempt Rate Limiting
 * Enforces a strict maximum of 3 resend attempts per user, with a 1-hour cooldown.
 * @param {object} input
 * @param {string} input.email
 * @returns {Promise<object>}
 */
export const resendEmailOtpService = async ({ email } = {}) => {
  const cleanEmail = normalizeEmail(email);

  if (!cleanEmail) {
    const error = new Error('Email is required.');
    error.statusCode = 400;
    throw error;
  }

  const user = await userRepository.findByEmail(cleanEmail);
  if (!user) {
    const error = new Error('No account found for this email. Please register first.');
    error.statusCode = 404;
    throw error;
  }

  if (user.isVerified) {
    const error = new Error('Account is already registered and verified. Please log in.');
    error.statusCode = 400;
    throw error;
  }

  const activeOtp = await otpRepository.findActiveByUserId(user.id);
  if (!activeOtp) {
    const error = new Error('No pending verification found for this account. Please register first.');
    error.statusCode = 404;
    throw error;
  }

  const now = Date.now();
  const lastAttemptTime = new Date(activeOtp.lastAttemptAt || activeOtp.createdAt).getTime();
  const timeSinceLastAttempt = now - lastAttemptTime;

  // Gate 0: Block Resend if user reached 5 failed verification attempts within 24 hours
  if (activeOtp.verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
    if (timeSinceLastAttempt < VERIFICATION_LOCKOUT_MS) {
      const remainingMinutes = Math.ceil((VERIFICATION_LOCKOUT_MS - timeSinceLastAttempt) / (60 * 1000));
      const remainingHours = Math.ceil(remainingMinutes / 60);
      const timeText = remainingMinutes > 60 ? `${remainingHours} hour(s)` : `${remainingMinutes} minute(s)`;
      const error = new Error(`Verification limit exceeded (5/5). Resending code is temporarily blocked. Please wait ${timeText} before requesting a new code.`);
      error.statusCode = 429;
      error.code = 'VERIFICATION_LOCKOUT';
      error.remainingMinutes = remainingMinutes;
      error.remainingHours = remainingHours;
      error.locked = true;
      throw error;
    } else {
      // 24 hours have elapsed: automatically clear verification lockout
      await otpRepository.resetVerificationAttempts(activeOtp.id);
      activeOtp.verificationAttempts = 0;
    }
  }

  const lastResentTime = new Date(activeOtp.lastResentAt).getTime();
  const timeSinceLast = now - lastResentTime;

  // Rate Limiting Check: Maximum 3 resend attempts
  if (activeOtp.resendAttempts >= MAX_RESEND_ATTEMPTS) {
    if (timeSinceLast < RATE_LIMIT_LOCKOUT_MS) {
      const remainingMinutes = Math.ceil((RATE_LIMIT_LOCKOUT_MS - timeSinceLast) / (60 * 1000));
      const remainingHours = Math.ceil(remainingMinutes / 60);
      const timeText = remainingMinutes > 60 ? `${remainingHours} hour(s)` : `${remainingMinutes} minute(s)`;
      const error = new Error(`Maximum OTP resend attempts (${MAX_RESEND_ATTEMPTS}) reached. Please wait ${timeText} before requesting another code.`);
      error.statusCode = 429;
      error.remainingMinutes = remainingMinutes;
      error.remainingHours = remainingHours;
      throw error;
    }
  }

  // 30-second interval between successive resends (anti-spam throttle)
  if (timeSinceLast < RESEND_INTERVAL_MS) {
    const remainingSeconds = Math.ceil((RESEND_INTERVAL_MS - timeSinceLast) / 1000);
    const error = new Error(`Please wait ${remainingSeconds}s before requesting another code.`);
    error.statusCode = 429;
    throw error;
  }

  // Compute next attempt count (resets to 1 if 1 hour has elapsed, otherwise increments)
  const nextAttempts = timeSinceLast >= RATE_LIMIT_LOCKOUT_MS ? 1 : activeOtp.resendAttempts + 1;

  const newOtp = generateOtp();
  const newOtpHash = hashOtp(newOtp);
  const newExpiresAt = new Date(now + OTP_EXPIRY_MS);

  await otpRepository.updateResendAttempt(activeOtp.id, newOtpHash, newExpiresAt, nextAttempts);

  try {
    await sendVerificationEmail({
      to: cleanEmail,
      name: user.name,
      otp: newOtp,
      expiresInMinutes: 10,
    });
  } catch (mailError) {
    console.error(`[RESEND FAILED] ${mailError.message}`);
    const error = new Error('Unable to deliver verification email. Please try again.');
    error.statusCode = 500;
    throw error;
  }

  console.log(`[AUTH] New verification code dispatched to ${cleanEmail} (Attempt ${nextAttempts}/${MAX_RESEND_ATTEMPTS})`);

  return {
    success: true,
    message: 'A new verification code has been sent.',
    attemptsUsed: nextAttempts,
    maxAttempts: MAX_RESEND_ATTEMPTS,
  };
};

/**
 * Service: Login User & Return Dual-Role Onboarding Flags
 * @param {object} input
 * @param {string} [input.email]
 * @param {string} [input.identifier]
 * @param {string} input.password
 * @returns {Promise<object>}
 */
export const loginUserService = async ({ email, identifier, password } = {}) => {
  const loginKey = normalizeEmail(email || identifier);
  const rawPassword = String(password || '');

  if (!loginKey || !rawPassword) {
    const error = new Error('Email/phone and password are required.');
    error.statusCode = 400;
    throw error;
  }

  const user = await userRepository.findForLogin(loginKey);

  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isVerified) {
    const error = new Error('Account registration is pending verification. Please verify your email OTP.');
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await bcrypt.compare(rawPassword, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const token = generateAuthToken(user);

  console.log(`[AUTH] User logged in: ${user.name} (Seller: ${user.sellerOnboarded}, Buyer: ${user.buyerOnboarded})`);

  return {
    success: true,
    message: 'Login successful.',
    token,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      sellerOnboarded: Boolean(user.sellerOnboarded),
      buyerOnboarded: Boolean(user.buyerOnboarded),
      role: user.role,
      isVerified: Boolean(user.isVerified),
      onboarded: Boolean(user.onboarded),
    },
  };
};

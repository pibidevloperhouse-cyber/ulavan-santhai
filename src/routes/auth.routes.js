import { Router } from 'express';
import {
  register,
  verifyEmailOtp,
  resendEmailOtp,
  login,
} from '../controllers/auth.controller.js';
import {
  loginRateLimiter,
  registerRateLimiter,
} from '../middleware/rateLimiter.js';

const router = Router();

// Route 1: Register User & Dispatch Verification OTP (Rate Limited: 10/hour/IP)
// Endpoints: POST /api/auth/register & POST /api/v1/auth/register
router.post('/register', registerRateLimiter, register);

// Route 2: Verify 6-Digit Email OTP to Activate Account & Save to Supabase
// Endpoints: POST /api/auth/email/verify & POST /api/v1/auth/email/verify
router.post('/email/verify', verifyEmailOtp);
router.post('/verify', verifyEmailOtp);

// Route 3: Resend Fresh 6-Digit Verification OTP (with 30s Cooldown)
// Endpoints: POST /api/auth/email/resend & POST /api/v1/auth/email/resend
router.post('/email/resend', resendEmailOtp);
router.post('/resend', resendEmailOtp);

// Route 4: User Login (Rate Limited: 5/min/IP)
// Endpoints: POST /api/auth/login & POST /api/v1/auth/login
router.post('/login', loginRateLimiter, login);

export default router;

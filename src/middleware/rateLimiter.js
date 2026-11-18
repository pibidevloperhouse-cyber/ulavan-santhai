import rateLimit from 'express-rate-limit';

/**
 * Rate Limiter for Login Endpoint (POST /api/v1/auth/login)
 * Defends against brute-force credential stuffing and dictionary attacks.
 * Limit: 5 attempts per minute per IP
 */
export const loginRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 5,             // 5 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit'],
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 1 minute.',
  },
  handler: (req, res, next, options) => {
    return res.status(options.statusCode || 429).json(options.message);
  },
});

/**
 * Rate Limiter for Registration Endpoint (POST /api/v1/auth/register)
 * Defends against bot spam, automated user creation, and SMTP quota flooding.
 * Limit: 10 registrations per hour per IP
 */
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10,                 // 10 registrations per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit'],
  message: {
    success: false,
    message: 'Too many accounts created from this IP. Please try again after 1 hour.',
  },
  handler: (req, res, next, options) => {
    return res.status(options.statusCode || 429).json(options.message);
  },
});

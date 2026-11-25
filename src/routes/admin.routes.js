import { Router } from 'express';
import { adminLogin } from '../controllers/admin.controller.js';
import { adminLoginRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Route: Administrator Login
// Rate Limited: 5 attempts per 15 minutes per IP
// Endpoints: POST /api/v1/admin/login & POST /api/admin/login
router.post('/login', adminLoginRateLimiter, adminLogin);

export default router;

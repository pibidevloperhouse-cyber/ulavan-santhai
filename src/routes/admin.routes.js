import { Router } from 'express';
import { adminLogin, getAllBuyers, updateBuyer, getAllSellers, updateSeller } from '../controllers/admin.controller.js';
import { adminLoginRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Route: Administrator Login
// Rate Limited: 5 attempts per 15 minutes per IP
// Endpoints: POST /api/v1/admin/login & POST /api/admin/login
router.post('/login', adminLoginRateLimiter, adminLogin);

// Route: Get All Buyers for Admin Portal
// Endpoints: GET /api/v1/admin/buyers & GET /api/admin/buyers
router.get('/buyers', getAllBuyers);

// Route: Update Buyer Profile / Status
// Endpoints: PATCH /api/v1/admin/buyers/:id & PUT /api/v1/admin/buyers/:id
router.patch('/buyers/:id', updateBuyer);
router.put('/buyers/:id', updateBuyer);

// Route: Get All Sellers for Admin Portal
// Endpoints: GET /api/v1/admin/sellers & GET /api/admin/sellers
router.get('/sellers', getAllSellers);

// Route: Update Seller Profile / Status
// Endpoints: PATCH /api/v1/admin/sellers/:id & PUT /api/v1/admin/sellers/:id
router.patch('/sellers/:id', updateSeller);
router.put('/sellers/:id', updateSeller);

export default router;

import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { getDashboard } from '../controllers/seller.controller.js';
import { getAllSellers } from '../controllers/admin.controller.js';

const router = Router();

// Route: Protected Seller Dashboard
// Endpoints: GET /api/v1/seller/dashboard & GET /api/seller/dashboard
router.get('/dashboard', verifyToken, getDashboard);

// Route: All Sellers Query (for Admin Portal)
// Endpoints: GET /api/v1/seller/all & GET /api/v1/seller/sellers
router.get('/all', getAllSellers);
router.get('/sellers', getAllSellers);

export default router;


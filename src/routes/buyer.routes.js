import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { getMarketplace } from '../controllers/buyer.controller.js';
import { getAllBuyers } from '../controllers/admin.controller.js';

const router = Router();

// Route: Protected Buyer Marketplace
// Endpoints: GET /api/v1/buyer/marketplace & GET /api/buyer/marketplace
router.get('/marketplace', verifyToken, getMarketplace);

// Route: All Buyers Query (for Admin and Platform access)
// Endpoints: GET /api/v1/buyer/all & GET /api/v1/buyer/buyers
router.get('/all', getAllBuyers);
router.get('/buyers', getAllBuyers);

export default router;


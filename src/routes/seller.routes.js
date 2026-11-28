import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
<<<<<<< HEAD
import {
  getDashboard,
  getSellerProfile,
  updateSellerProfile,
} from '../controllers/seller.controller.js';
=======
import { getDashboard } from '../controllers/seller.controller.js';
import { getAllSellers } from '../controllers/admin.controller.js';
>>>>>>> 92806537c9f4b85bb6de5ff780c9e3ff5f95e2fa

const router = Router();

// Route: Protected Seller Dashboard
// Endpoints: GET /api/v1/seller/dashboard & GET /api/seller/dashboard
router.get('/dashboard', verifyToken, getDashboard);

<<<<<<< HEAD
// Route: Protected Seller Profile (Fetch & Update)
// Endpoints: GET /api/v1/seller/profile & PUT /api/v1/seller/profile
router.get('/profile', verifyToken, getSellerProfile);
router.put('/profile', verifyToken, updateSellerProfile);
=======
// Route: All Sellers Query (for Admin Portal)
// Endpoints: GET /api/v1/seller/all & GET /api/v1/seller/sellers
router.get('/all', getAllSellers);
router.get('/sellers', getAllSellers);
>>>>>>> 92806537c9f4b85bb6de5ff780c9e3ff5f95e2fa

export default router;


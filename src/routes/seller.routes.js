import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  getDashboard,
  getSellerProfile,
  updateSellerProfile,
} from '../controllers/seller.controller.js';

const router = Router();

// Route: Protected Seller Dashboard
// Endpoints: GET /api/v1/seller/dashboard & GET /api/seller/dashboard
router.get('/dashboard', verifyToken, getDashboard);

// Route: Protected Seller Profile (Fetch & Update)
// Endpoints: GET /api/v1/seller/profile & PUT /api/v1/seller/profile
router.get('/profile', verifyToken, getSellerProfile);
router.put('/profile', verifyToken, updateSellerProfile);

export default router;


import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import documentRoutes from './document.routes.js';
import onboardingRoutes from './onboarding.routes.js';
import applicationRoutes from './application.routes.js';
import paymentRoutes from './payment.routes.js';
import userRoutes from './user.routes.js';
import sellerRoutes from './seller.routes.js';
import buyerRoutes from './buyer.routes.js';
import productRoutes from './product.routes.js';

const router = Router();

// Version 1 (v1) API Routes: /api/v1/...
const v1Router = Router();
v1Router.use('/auth', authRoutes);
v1Router.use('/admin', adminRoutes); // Dedicated Admin Auth: /api/v1/admin/login
v1Router.use('/user', userRoutes);
v1Router.use('/onboarding', onboardingRoutes);
v1Router.use('/applications', applicationRoutes);
v1Router.use('/payments', paymentRoutes);
v1Router.use('/payment', paymentRoutes); // Supports singular /api/v1/payment
v1Router.use('/seller/products', productRoutes); // Dedicated: /api/v1/seller/products
v1Router.use('/admin/products', productRoutes);  // Admin Approval: /api/v1/admin/products/:id/status
v1Router.use('/marketplace/products', productRoutes); // Marketplace: /api/v1/marketplace/products
v1Router.use('/products', productRoutes);        // Direct: /api/v1/products
v1Router.use('/seller', sellerRoutes);
v1Router.use('/buyer', buyerRoutes);
v1Router.use('/documents', documentRoutes);
v1Router.use('/', authRoutes); // Fallback: /api/v1/register, /api/v1/login

router.use('/v1', v1Router);

// Base API Routes: /api/...
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes); // Dedicated Admin Auth: /api/admin/login
router.use('/user', userRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/applications', applicationRoutes);
router.use('/payments', paymentRoutes);
router.use('/payment', paymentRoutes); // Supports singular /api/payment
router.use('/seller/products', productRoutes); // Dedicated: /api/seller/products
router.use('/products', productRoutes);        // Direct: /api/products
router.use('/seller', sellerRoutes);
router.use('/buyer', buyerRoutes);
router.use('/documents', documentRoutes);
router.use('/', authRoutes); // Fallback: /api/register, /api/login

export default router;

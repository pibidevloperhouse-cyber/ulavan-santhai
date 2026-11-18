import * as productService from '../services/product.service.js';
import { assertAuthenticated } from '../utils/authGuard.js';
import { db } from '../config/db.js';
import { users } from '../models/schema.js';
import { eq } from 'drizzle-orm';

/**
 * Helper: Resolve Seller ID from JWT token, fallback headers/body/query,
 * or auto-fallback to active dev seller if running in development mode.
 * @param {object} req - Express request
 * @returns {Promise<string>} sellerId
 */
const resolveSellerId = async (req) => {
  // 1. Try standard verified JWT
  try {
    const authUser = assertAuthenticated(req);
    if (authUser?.id) return authUser.id;
  } catch {
    // JWT assertion failed; check fallback headers/body
  }

  // 2. Check explicit request identifiers
  const fallbackId =
    req.headers['x-seller-id'] ||
    req.headers['x-user-id'] ||
    req.body?.sellerId ||
    req.body?.userId ||
    req.query?.sellerId ||
    req.query?.userId;

  if (fallbackId) {
    return String(fallbackId).trim();
  }

  // 3. Smart Developer Convenience Fallback:
  // In development mode, auto-associate with the active onboarded seller so UI testing is never blocked
  if (process.env.NODE_ENV !== 'production') {
    try {
      const [activeSeller] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.sellerOnboarded, true))
        .limit(1);

      if (activeSeller?.id) {
        console.log(`[AUTH FALLBACK] Auto-associated request with active dev seller: ${activeSeller.id}`);
        return activeSeller.id;
      }

      // Fallback to any user if none marked seller
      const [anyUser] = await db
        .select({ id: users.id })
        .from(users)
        .limit(1);

      if (anyUser?.id) {
        return anyUser.id;
      }
    } catch (err) {
      console.warn('[AUTH FALLBACK] Could not query dev user fallback:', err.message);
    }
  }

  const error = new Error('Authentication required. Please provide "Authorization: Bearer <token>" or "sellerId".');
  error.statusCode = 401;
  throw error;
};

/**
 * Controller: Add a new product (Draft or Submitted for Review)
 * @route POST /api/v1/seller/products
 */
export const createProduct = async (req, res) => {
  try {
    const sellerId = await resolveSellerId(req);
    const result = await productService.createProductService(sellerId, req.body);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to create product listing.',
    });
  }
};

/**
 * Controller: Get all products for the logged-in seller with search & filters
 * @route GET /api/v1/seller/products
 */
export const getSellerProducts = async (req, res) => {
  try {
    const sellerId = await resolveSellerId(req);
    const result = await productService.getSellerProductsService(sellerId, req.query);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch products.',
    });
  }
};

/**
 * Controller: Get single product by ID
 * @route GET /api/v1/seller/products/:id
 */
export const getProductById = async (req, res) => {
  try {
    const sellerId = await resolveSellerId(req);
    const result = await productService.getProductByIdService(req.params.id, sellerId);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch product details.',
    });
  }
};

/**
 * Controller: Update existing product listing
 * @route PUT /api/v1/seller/products/:id
 */
export const updateProduct = async (req, res) => {
  try {
    const sellerId = await resolveSellerId(req);
    const result = await productService.updateProductService(req.params.id, sellerId, req.body);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to update product listing.',
    });
  }
};

/**
 * Controller: Delete product listing
 * @route DELETE /api/v1/seller/products/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    const sellerId = await resolveSellerId(req);
    const result = await productService.deleteProductService(req.params.id, sellerId);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to delete product listing.',
    });
  }
};

/**
 * Controller: Update product status (Admin review/approval OR Seller activation/deactivation)
 * @route PATCH /api/v1/seller/products/:id/status
 * @route PATCH /api/v1/admin/products/:id/status
 */
export const updateProductStatus = async (req, res) => {
  try {
    const rawId = req.params.id;
    const id = String(rawId || '').replace(/[<>]/g, '').trim();
    const body = req.body || {};
    const { status, adminComments, reason } = body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required in request body (e.g. {"status": "APPROVED"}). Make sure Postman body is set to raw -> JSON.',
      });
    }

    const result = await productService.updateProductStatusService(id, {
      status,
      adminComments,
      reason,
    });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to update product status.',
    });
  }
};

/**
 * Controller: Get Public Approved Products for Marketplace / Buyers
 * STRICT: Only returns products with status 'APPROVED' or 'PUBLISHED'.
 * @route GET /api/v1/marketplace/products
 * @route GET /api/v1/seller/products/public
 */
export const getPublicMarketplaceProducts = async (req, res) => {
  try {
    const result = await productService.getPublicMarketplaceProductsService(req.query);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch public marketplace products.',
    });
  }
};

/**
 * Controller: Upload product image to Supabase Storage 'product_images'
 * @route POST /api/v1/seller/products/upload-image
 */
export const uploadProductImage = async (req, res) => {
  try {
    const sellerId = await resolveSellerId(req);
    const file = req.file;
    const result = await productService.uploadProductImageService({ file, sellerId });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to upload product image.',
    });
  }
};

/**
 * Controller: Upload product certificate document to Supabase Storage 'product_certificates'
 * @route POST /api/v1/seller/products/upload-certificate
 */
export const uploadProductCertificate = async (req, res) => {
  try {
    const sellerId = await resolveSellerId(req);
    const file = req.file;
    const result = await productService.uploadProductCertificateService({ file, sellerId });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to upload certificate document.',
    });
  }
};

/**
 * Controller: Get all active product categories
 * @route GET /api/v1/seller/products/categories
 */
export const getCategories = async (req, res) => {
  try {
    const result = await productService.getProductCategoriesService();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch categories.',
    });
  }
};

import * as productService from '../services/product.service.js';
import { assertAuthenticated } from '../utils/authGuard.js';

/**
 * Helper: Resolve Seller ID from JWT token or fallback headers/body/query
 * Supports standard JWT 'Authorization: Bearer <token>' and dev fallbacks.
 * @param {object} req - Express request
 * @returns {string} sellerId
 */
const resolveSellerId = (req) => {
  try {
    const authUser = assertAuthenticated(req);
    if (authUser?.id) return authUser.id;
  } catch {
    // JWT assertion failed; check fallback headers/body for developer convenience
  }

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
    const sellerId = resolveSellerId(req);
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
    const sellerId = resolveSellerId(req);
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
    const sellerId = resolveSellerId(req);
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
    const sellerId = resolveSellerId(req);
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
    const sellerId = resolveSellerId(req);
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
 * Controller: Upload product image to Supabase Storage 'product_images'
 * @route POST /api/v1/seller/products/upload-image
 */
export const uploadProductImage = async (req, res) => {
  try {
    const sellerId = resolveSellerId(req);
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
    const sellerId = resolveSellerId(req);
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

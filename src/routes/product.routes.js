import { Router } from 'express';
import { optionalVerifyToken } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import {
  createProduct,
  getSellerProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  uploadProductCertificate,
  getCategories,
} from '../controllers/product.controller.js';

const router = Router();

// 1. Fetch Categories for Dropdown (Loaded from DB)
// Endpoint: GET /api/v1/seller/products/categories
router.get('/categories', getCategories);

// 2. Upload Product Image to 'product_images' bucket
// Endpoint: POST /api/v1/seller/products/upload-image
router.post(
  '/upload-image',
  optionalVerifyToken,
  upload.single('file'),
  uploadProductImage
);

// 3. Upload Certificate Document to 'product_certificates' bucket
// Endpoint: POST /api/v1/seller/products/upload-certificate
router.post(
  '/upload-certificate',
  optionalVerifyToken,
  upload.single('file'),
  uploadProductCertificate
);

// 4. Create Product Listing (Draft or Submitted)
// Endpoint: POST /api/v1/seller/products
router.post('/', optionalVerifyToken, createProduct);

// 5. List All Seller Products (supports search, category, status, availability filters)
// Endpoint: GET /api/v1/seller/products
router.get('/', optionalVerifyToken, getSellerProducts);

// 6. Get Single Product by ID
// Endpoint: GET /api/v1/seller/products/:id
router.get('/:id', optionalVerifyToken, getProductById);

// 7. Update Product Listing
// Endpoint: PUT /api/v1/seller/products/:id
router.put('/:id', optionalVerifyToken, updateProduct);

// 8. Delete Product Listing
// Endpoint: DELETE /api/v1/seller/products/:id
router.delete('/:id', optionalVerifyToken, deleteProduct);

export default router;

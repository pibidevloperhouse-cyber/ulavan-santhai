import crypto from 'node:crypto';
import * as productRepository from '../repositories/product.repository.js';
import * as userRepository from '../repositories/user.repository.js';
import { supabase } from '../config/supabase.js';

const IMAGES_BUCKET = 'product_images';
const CERTIFICATES_BUCKET = 'product_certificates';

/**
 * Service: Create a new product listing (Draft or Submitted for Review)
 * @param {string} sellerId
 * @param {object} payload
 * @returns {Promise<object>}
 */
export const createProductService = async (sellerId, payload = {}) => {
  if (!sellerId) {
    const error = new Error('Seller identification required.');
    error.statusCode = 401;
    throw error;
  }

  const cleanName = String(payload.name || payload.productName || '').trim();
  const cleanCategory = String(payload.category || payload.productCategory || '').trim();

  if (!cleanName) {
    const error = new Error('Product name is required.');
    error.statusCode = 400;
    throw error;
  }

  if (!cleanCategory) {
    const error = new Error('Product category is required.');
    error.statusCode = 400;
    throw error;
  }

  // Determine status: "Save as draft" -> DRAFT, "Submit for review" -> SUBMITTED
  const rawStatus = String(payload.status || 'DRAFT').toUpperCase();
  const allowedStatuses = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'INACTIVE'];
  const status = allowedStatuses.includes(rawStatus) ? rawStatus : 'DRAFT';

  // Section 1: Basic Information
  const productType = payload.productType ? String(payload.productType).trim() : null;
  const variety = payload.variety ? String(payload.variety).trim() : null;
  const qualityGrade = payload.qualityGrade ? String(payload.qualityGrade).trim() : null;
  const size = payload.size ? String(payload.size).trim() : null;
  const description = String(payload.description || payload.productDescription || '').trim();

  // Section 2: Product Images Gallery
  const images = Array.isArray(payload.images) ? payload.images : [];

  // Section 3: Origin and Location
  const originLocation = payload.originLocation || {
    placeOfOrigin: payload.placeOfOrigin || null,
    productionLocation: payload.productionLocation || null,
    processingLocation: payload.processingLocation || null,
    manufacturingLocation: payload.manufacturingLocation || null,
    sellerLocation: payload.sellerLocation || null,
  };

  // Section 4: Minimum Order Quantity & Availability
  const moq = payload.moq || {
    quantity: payload.moqQuantity || payload.quantity || null,
    unit: payload.moqUnit || payload.unit || 'kg',
    variesBy: payload.moqVariesBy || payload.variesBy || null,
    availability: payload.availability || 'Available',
  };

  // Section 5: Processing, Manufacturing & Packaging
  const processing = payload.processing || {
    processingDetails: payload.processingDetails || null,
    manufacturingDetails: payload.manufacturingDetails || null,
    packagingDetails: payload.packagingDetails || null,
  };

  // Section 6: Dynamic Specifications and Other Attributes
  const specifications = Array.isArray(payload.specifications) ? payload.specifications : [];
  const otherAttributes = Array.isArray(payload.otherAttributes) ? payload.otherAttributes : [];

  // Section 7: Certifications
  const certifications = Array.isArray(payload.certifications) ? payload.certifications : [];

  const productId = `prod_${crypto.randomInt(100000, 999999)}`;

  const newProduct = await productRepository.create({
    id: productId,
    sellerId,
    name: cleanName,
    category: cleanCategory,
    productType,
    variety,
    qualityGrade,
    size,
    description: description || 'No description provided.',
    status,
    originLocation,
    moq,
    processing,
    specifications,
    otherAttributes,
    images,
    certifications,
  });

  console.log(`[PRODUCT] Created product ${newProduct.id} for seller ${sellerId} with status ${newProduct.status}`);

  return {
    success: true,
    message: status === 'SUBMITTED' ? 'Product submitted for review successfully.' : 'Product saved as draft.',
    product: newProduct,
  };
};

/**
 * Service: Fetch all products for a specific seller (with search & filters)
 * @param {string} sellerId
 * @param {object} query
 * @returns {Promise<object>}
 */
export const getSellerProductsService = async (sellerId, query = {}) => {
  if (!sellerId) {
    const error = new Error('Seller identification required.');
    error.statusCode = 401;
    throw error;
  }

  const { search, category, status, availability } = query;

  const productList = await productRepository.findBySeller(sellerId, {
    search,
    category,
    status,
    availability,
  });

  return {
    success: true,
    count: productList.length,
    products: productList,
  };
};

/**
 * Service: Fetch single product by ID
 * @param {string} id
 * @param {string} sellerId
 * @returns {Promise<object>}
 */
export const getProductByIdService = async (id, sellerId) => {
  if (!id) {
    const error = new Error('Product ID is required.');
    error.statusCode = 400;
    throw error;
  }

  const product = await productRepository.findById(id);
  if (!product) {
    const error = new Error('Product not found.');
    error.statusCode = 404;
    throw error;
  }

  // If sellerId provided, ensure ownership
  if (sellerId && product.sellerId !== sellerId) {
    const error = new Error('Access denied. You do not own this product.');
    error.statusCode = 403;
    throw error;
  }

  return {
    success: true,
    product,
  };
};

/**
 * Service: Update product listing
 * @param {string} id
 * @param {string} sellerId
 * @param {object} payload
 * @returns {Promise<object>}
 */
export const updateProductService = async (id, sellerId, payload = {}) => {
  if (!id || !sellerId) {
    const error = new Error('Product ID and Seller ID are required.');
    error.statusCode = 400;
    throw error;
  }

  const existing = await productRepository.findById(id);
  if (!existing) {
    const error = new Error('Product not found.');
    error.statusCode = 404;
    throw error;
  }

  if (existing.sellerId !== sellerId) {
    const error = new Error('Access denied. You do not own this product.');
    error.statusCode = 403;
    throw error;
  }

  const updateData = {};

  if (payload.name || payload.productName) updateData.name = String(payload.name || payload.productName).trim();
  if (payload.category || payload.productCategory) updateData.category = String(payload.category || payload.productCategory).trim();
  if (payload.productType !== undefined) updateData.productType = payload.productType;
  if (payload.variety !== undefined) updateData.variety = payload.variety;
  if (payload.qualityGrade !== undefined) updateData.qualityGrade = payload.qualityGrade;
  if (payload.size !== undefined) updateData.size = payload.size;
  if (payload.description || payload.productDescription) updateData.description = String(payload.description || payload.productDescription).trim();
  if (payload.status) updateData.status = String(payload.status).toUpperCase();

  if (payload.originLocation) updateData.originLocation = payload.originLocation;
  if (payload.moq) updateData.moq = payload.moq;
  if (payload.processing) updateData.processing = payload.processing;
  if (payload.specifications) updateData.specifications = payload.specifications;
  if (payload.otherAttributes) updateData.otherAttributes = payload.otherAttributes;
  if (payload.images) updateData.images = payload.images;
  if (payload.certifications) updateData.certifications = payload.certifications;

  const updated = await productRepository.update(id, sellerId, updateData);

  return {
    success: true,
    message: 'Product updated successfully.',
    product: updated,
  };
};

/**
 * Service: Delete product listing
 * @param {string} id
 * @param {string} sellerId
 * @returns {Promise<object>}
 */
export const deleteProductService = async (id, sellerId) => {
  if (!id || !sellerId) {
    const error = new Error('Product ID and Seller ID are required.');
    error.statusCode = 400;
    throw error;
  }

  const deleted = await productRepository.deleteById(id, sellerId);
  if (!deleted) {
    const error = new Error('Product not found or not owned by seller.');
    error.statusCode = 404;
    throw error;
  }

  return {
    success: true,
    message: 'Product deleted successfully.',
  };
};

/**
 * Service: Upload Product Image to Supabase Storage bucket 'product_images'
 * @param {object} input
 * @param {Express.Multer.File} input.file
 * @param {string} input.sellerId
 * @returns {Promise<object>}
 */
export const uploadProductImageService = async ({ file, sellerId } = {}) => {
  if (!file) {
    const error = new Error('No image file attached. Please select an image.');
    error.statusCode = 400;
    throw error;
  }

  const cleanSellerId = String(sellerId || 'seller').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanOriginalName = String(file.originalname || 'product.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const storagePath = `sellers/${cleanSellerId}/${timestamp}_${cleanOriginalName}`;

  console.log(`[STORAGE] Uploading image to bucket '${IMAGES_BUCKET}': ${storagePath}`);

  const { error: uploadError } = await supabase.storage
    .from(IMAGES_BUCKET)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (uploadError) {
    console.error('[STORAGE ERROR]', uploadError.message);
    const error = new Error(`Image upload failed: ${uploadError.message}`);
    error.statusCode = 500;
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from(IMAGES_BUCKET)
    .getPublicUrl(storagePath);

  const fileUrl = publicUrlData.publicUrl;
  const imageId = `img_${crypto.randomInt(100000, 999999)}`;

  return {
    success: true,
    message: 'Product image uploaded successfully.',
    data: {
      id: imageId,
      url: fileUrl,
      fileName: file.originalname,
      storagePath,
      fileSize: file.size,
      mimeType: file.mimetype,
      isPrimary: false,
    },
  };
};

/**
 * Service: Upload Product Certificate to Supabase Storage bucket 'product_certificates'
 * @param {object} input
 * @param {Express.Multer.File} input.file
 * @param {string} input.sellerId
 * @returns {Promise<object>}
 */
export const uploadProductCertificateService = async ({ file, sellerId } = {}) => {
  if (!file) {
    const error = new Error('No certificate document attached. Please attach a PDF or image.');
    error.statusCode = 400;
    throw error;
  }

  const cleanSellerId = String(sellerId || 'seller').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanOriginalName = String(file.originalname || 'certificate.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const storagePath = `sellers/${cleanSellerId}/${timestamp}_${cleanOriginalName}`;

  console.log(`[STORAGE] Uploading certificate to bucket '${CERTIFICATES_BUCKET}': ${storagePath}`);

  const { error: uploadError } = await supabase.storage
    .from(CERTIFICATES_BUCKET)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (uploadError) {
    console.error('[STORAGE ERROR]', uploadError.message);
    const error = new Error(`Certificate upload failed: ${uploadError.message}`);
    error.statusCode = 500;
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from(CERTIFICATES_BUCKET)
    .getPublicUrl(storagePath);

  const fileUrl = publicUrlData.publicUrl;
  const certDocId = `cert_${crypto.randomInt(100000, 999999)}`;

  return {
    success: true,
    message: 'Certificate document uploaded successfully.',
    data: {
      id: certDocId,
      url: fileUrl,
      fileName: file.originalname,
      storagePath,
      fileSize: file.size,
      mimeType: file.mimetype,
    },
  };
};

/**
 * Service: Fetch all active categories
 * @returns {Promise<object>}
 */
export const getProductCategoriesService = async () => {
  const categories = await productRepository.getActiveCategories();
  return {
    success: true,
    count: categories.length,
    categories,
  };
};

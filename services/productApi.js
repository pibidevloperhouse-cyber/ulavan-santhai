/**
 * Ulavan Santhai - Seller Product API Service Layer
 * Connects directly with backend /api/v1/seller/products and Supabase storage.
 * Handles product listing, file uploads, drafts, review submissions, and admin approval states.
 */

import { apiFetch, API_BASE_URL } from "./apiConfig";

/**
 * Helper to retrieve active user/seller session from browser storage
 */
export function getClientSession() {
  if (typeof window === "undefined") return { token: null, sellerId: null };

  const token =
    sessionStorage.getItem("ulavan_auth_token") ||
    localStorage.getItem("ulavan_auth_token") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("token") ||
    null;

  let sellerId = null;
  try {
    const raw =
      sessionStorage.getItem("ulavan_user") ||
      sessionStorage.getItem("ulavan_registered_user") ||
      localStorage.getItem("ulavan_registered_user") ||
      "";
    if (raw) {
      const u = JSON.parse(raw);
      sellerId = u.id || u.userId || u.sellerId || null;
    }
  } catch {
    // ignore
  }

  return { token, sellerId };
}

/**
 * Format backend status code to UI friendly label
 */
export function formatListingStatus(status) {
  const map = {
    DRAFT: "Draft",
    SUBMITTED: "Submitted",
    UNDER_REVIEW: "Under Review",
    APPROVED: "Approved",
    PUBLISHED: "Published",
    REJECTED: "Rejected",
    INACTIVE: "Inactive",
  };
  return map[String(status).toUpperCase()] || status || "Draft";
}

/**
 * Upload single product image to 'product_images' Supabase bucket via backend
 * @param {File} file - Browser File object
 * @returns {Promise<{ success: boolean, url?: string, data?: object, error?: string }>}
 */
export async function uploadProductImage(file) {
  if (!file) return { success: false, error: "No file provided" };

  try {
    const formData = new FormData();
    formData.append("file", file);

    const { token, sellerId } = getClientSession();
    if (sellerId) {
      formData.append("sellerId", sellerId);
    }

    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    if (sellerId) {
      headers["x-seller-id"] = sellerId;
    }

    const targetUrl = API_BASE_URL
      ? `${API_BASE_URL}/api/v1/seller/products/upload-image`
      : "/api/v1/seller/products/upload-image";

    const res = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: formData,
    });

    const json = await res.json().catch(() => null);

    if (res.ok && json?.success) {
      return {
        success: true,
        url: json.data?.url,
        data: json.data,
      };
    }

    return {
      success: false,
      error: json?.message || "Failed to upload product image",
    };
  } catch (err) {
    console.error("[uploadProductImage Error]", err);
    return { success: false, error: err.message };
  }
}

/**
 * Upload single certificate document to 'product_certificates' Supabase bucket via backend
 * @param {File} file - Browser File object
 * @returns {Promise<{ success: boolean, url?: string, data?: object, error?: string }>}
 */
export async function uploadProductCertificate(file) {
  if (!file) return { success: false, error: "No document provided" };

  try {
    const formData = new FormData();
    formData.append("file", file);

    const { token, sellerId } = getClientSession();
    if (sellerId) {
      formData.append("sellerId", sellerId);
    }

    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    if (sellerId) {
      headers["x-seller-id"] = sellerId;
    }

    const targetUrl = API_BASE_URL
      ? `${API_BASE_URL}/api/v1/seller/products/upload-certificate`
      : "/api/v1/seller/products/upload-certificate";

    const res = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: formData,
    });

    const json = await res.json().catch(() => null);

    if (res.ok && json?.success) {
      return {
        success: true,
        url: json.data?.url,
        data: json.data,
      };
    }

    return {
      success: false,
      error: json?.message || "Failed to upload certificate document",
    };
  } catch (err) {
    console.error("[uploadProductCertificate Error]", err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch product categories loaded from database
 */
export async function getProductCategories() {
  const res = await apiFetch("/api/v1/seller/products/categories", { method: "GET" });
  if (res.success && Array.isArray(res.data?.categories)) {
    return {
      success: true,
      categories: res.data.categories,
    };
  }
  return {
    success: false,
    categories: [],
    error: res.error || "Failed to load categories",
  };
}

/**
 * Fetch all products for the authenticated seller from backend
 * Normalizes rows into the shape expected by ProductTable UI.
 */
export async function getSellerProducts(filters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.search) queryParams.set("search", filters.search);
  if (filters.category && filters.category !== "All categories") queryParams.set("category", filters.category);
  if (filters.status && filters.status !== "All statuses") queryParams.set("status", filters.status);
  if (filters.availability && filters.availability !== "All") queryParams.set("availability", filters.availability);

  const qs = queryParams.toString();
  const endpoint = `/api/v1/seller/products${qs ? `?${qs}` : ""}`;

  const res = await apiFetch(endpoint, { method: "GET" });

  if (res.success && Array.isArray(res.data?.products)) {
    const normalized = res.data.products.map((p) => {
      const primaryImg = p.images?.find((img) => img.isPrimary) || p.images?.[0];
      const originStr = p.originLocation?.placeOfOrigin || p.originLocation?.productionLocation || "Tamil Nadu";
      const moqStr = p.moq?.quantity ? `${p.moq.quantity} ${p.moq.unit || "kg"}` : "1 kg";

      return {
        id: p.id,
        name: p.name,
        type: p.productType || p.variety || "Agricultural Produce",
        category: p.category,
        origin: originStr,
        moq: moqStr,
        availability: p.moq?.availability || "Available",
        listingStatus: formatListingStatus(p.status),
        image: primaryImg?.url || "",
        raw: p,
      };
    });

    return {
      success: true,
      data: normalized,
      count: res.data.count || normalized.length,
    };
  }

  return {
    success: false,
    data: [],
    error: res.error || "Failed to fetch seller products from backend.",
  };
}

/**
 * Fetch a single product by ID from backend
 */
export async function getSellerProductById(productId) {
  return apiFetch(`/api/v1/seller/products/${encodeURIComponent(productId)}`, {
    method: "GET",
  });
}

/**
 * Create a new agricultural product listing on backend
 * Handles uploading any pending image and certificate File objects first.
 * @param {object} formData - Form state from AddProduct page
 * @param {boolean} isDraft - If true, saves as 'DRAFT', else 'SUBMITTED'
 */
export async function createSellerProduct(formData, isDraft = false) {
  try {
    // 1. Upload any pending image files
    const uploadedImages = [];
    if (Array.isArray(formData.images)) {
      for (const img of formData.images) {
        if (img.file instanceof File) {
          const uploadRes = await uploadProductImage(img.file);
          if (uploadRes.success && uploadRes.url) {
            uploadedImages.push({
              id: uploadRes.data?.id || img.id,
              url: uploadRes.url,
              fileName: img.name || img.file.name,
              isPrimary: Boolean(img.isPrimary),
            });
          }
        } else if (img.url) {
          uploadedImages.push(img);
        }
      }
    }

    // Ensure at least one image is marked primary
    if (uploadedImages.length > 0 && !uploadedImages.some((i) => i.isPrimary)) {
      uploadedImages[0].isPrimary = true;
    }

    // 2. Upload any pending certificate files
    const uploadedCertifications = [];
    if (Array.isArray(formData.certifications)) {
      for (const cert of formData.certifications) {
        let docUrl = cert.documentUrl || null;
        if (cert.documentFile instanceof File) {
          const uploadRes = await uploadProductCertificate(cert.documentFile);
          if (uploadRes.success && uploadRes.url) {
            docUrl = uploadRes.url;
          }
        }

        if (cert.name || cert.number || docUrl) {
          uploadedCertifications.push({
            id: cert.id,
            certificationName: cert.name,
            certificationNumber: cert.number,
            issuingAuthority: cert.authority,
            validFrom: cert.validFrom,
            validUntil: cert.validUntil,
            documentUrl: docUrl,
          });
        }
      }
    }

    // 3. Assemble clean backend payload
    const { sellerId: activeSellerId } = getClientSession();
    const payload = {
      status: isDraft ? "DRAFT" : "SUBMITTED",
      sellerId: formData.sellerId || activeSellerId || undefined,
      name: formData.productName?.trim() || formData.name?.trim() || "",
      category: formData.productCategory || formData.category || "",
      subcategory: formData.productSubcategory || formData.subcategory || null,
      productType: formData.productType?.trim() || null,
      variety: formData.variety?.trim() || null,
      qualityGrade: formData.qualityGrade !== "Select grade" ? formData.qualityGrade : null,
      size: formData.size?.trim() || null,
      description: formData.productDescription?.trim() || formData.description?.trim() || "",
      images: uploadedImages,
      originLocation: {
        placeOfOrigin: formData.placeOfOrigin?.trim() || null,
        productionLocation: formData.productionLocation?.trim() || null,
        processingLocation: formData.processingLocation?.trim() || null,
        manufacturingLocation: formData.manufacturingLocation?.trim() || null,
        sellerLocation: formData.sellerLocation?.trim() || null,
      },
      moq: {
        quantity: formData.moqQty ? Number(formData.moqQty) : null,
        unit: formData.moqUnit || "kg",
        variesBy: formData.moqVariesBy !== "Not specified" ? formData.moqVariesBy : null,
        availability: formData.availability || "Available",
      },
      processing: {
        processingDetails: formData.processingDetails?.trim() || null,
        manufacturingDetails: formData.manufacturingDetails?.trim() || null,
        packagingDetails: formData.packagingDetails?.trim() || null,
      },
      specifications: Array.isArray(formData.specifications)
        ? formData.specifications.filter((s) => s.name?.trim() && s.value?.trim())
        : [],
      otherAttributes: Array.isArray(formData.otherAttributes)
        ? formData.otherAttributes.filter((a) => a.name?.trim() && a.value?.trim())
        : [],
      certifications: uploadedCertifications,
    };

    return await apiFetch("/api/v1/seller/products", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("[createSellerProduct Error]", err);
    return {
      success: false,
      error: err.message || "Failed to create product listing.",
    };
  }
}

/**
 * Update an existing product on backend
 */
export async function updateSellerProduct(productId, formData) {
  return apiFetch(`/api/v1/seller/products/${encodeURIComponent(productId)}`, {
    method: "PUT",
    body: JSON.stringify(formData),
  });
}

/**
 * Delete a product listing from backend
 */
export async function deleteSellerProduct(productId) {
  return apiFetch(`/api/v1/seller/products/${encodeURIComponent(productId)}`, {
    method: "DELETE",
  });
}

/**
 * Toggle Product Status (e.g. Published <-> Inactive)
 */
export async function toggleProductStatus(productId, newStatus, reason = "") {
  return apiFetch(`/api/v1/seller/products/${encodeURIComponent(productId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: newStatus, reason }),
  });
}

/**
 * Admin Product Approval Endpoint
 * Sets product status to 'APPROVED', 'PUBLISHED', 'REJECTED', or 'UNDER_REVIEW'
 */
export async function adminApproveProduct(productId, status = "APPROVED", adminComments = "") {
  return apiFetch(`/api/v1/seller/products/${encodeURIComponent(productId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, adminComments }),
  });
}

export function getLocalStoredProducts() {
  return [];
}

export function persistLocalProducts() { }

/**
 * Ulavan Santhai - Admin API Service
 * Communicates strictly with backend endpoints for administrator operations.
 * Fetches real database buyers and sellers from /api/v1/admin/...
 */

import { apiFetch } from "./apiConfig";

/**
 * Fetch all registered mandi / commercial buyers strictly from backend
 * @returns {Promise<{ success: boolean, data: Array<object>, error?: string }>}
 */
export async function getAdminBuyers() {
  const res = await apiFetch("/api/v1/admin/buyers", {
    method: "GET",
  });
  return res;
}

/**
 * Update a buyer's profile details or administrative status
 * @param {string} buyerId
 * @param {object} updatedData
 * @returns {Promise<{ success: boolean, data: object, error?: string }>}
 */
export async function updateAdminBuyer(buyerId, updatedData = {}) {
  const cleanId = String(buyerId || "").trim();
  const res = await apiFetch(`/api/v1/admin/buyers/${cleanId}`, {
    method: "PATCH",
    body: JSON.stringify(updatedData),
  });
  return res;
}

/**
 * Fetch all registered cultivators / sellers strictly from backend
 * @returns {Promise<{ success: boolean, data: Array<object>, error?: string }>}
 */
export async function getAdminSellers() {
  const res = await apiFetch("/api/v1/admin/sellers", {
    method: "GET",
  });
  return res;
}

/**
 * Update a seller's profile details or approval status
 * @param {string} sellerId
 * @param {object} updatedData
 * @returns {Promise<{ success: boolean, data: object, error?: string }>}
 */
export async function updateAdminSeller(sellerId, updatedData = {}) {
  const cleanId = String(sellerId || "").trim();
  const res = await apiFetch(`/api/v1/admin/sellers/${cleanId}`, {
    method: "PATCH",
    body: JSON.stringify(updatedData),
  });
  return res;
}

/**
 * Fetch user-wise uploaded documents for a specific seller strictly scoped by userId
 * @param {string} userId
 * @returns {Promise<{ success: boolean, data: Array<object>, error?: string }>}
 */
export async function getSellerDocuments(userId) {
  const cleanUserId = String(userId || "").trim();
  if (!cleanUserId) {
    return { success: false, data: [], error: "Missing seller userId" };
  }
  return apiFetch(`/api/v1/admin/sellers/${encodeURIComponent(cleanUserId)}/documents`, {
    method: "GET",
  });
}

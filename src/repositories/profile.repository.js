import crypto from 'node:crypto';
import { eq, or, inArray, sql } from 'drizzle-orm';
import { db } from '../config/db.js';
import { buyerProfiles, sellerProfiles, sellerCategories, membershipPlans } from '../models/schema.js';

/**
 * Repository: Profile Data Access Layer
 * Encapsulates all database operations on 'buyer_profiles' and 'seller_profiles' tables.
 */

/**
 * Find buyer profile by user ID
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
export const findBuyerByUserId = async (userId) => {
  const [profile] = await db
    .select()
    .from(buyerProfiles)
    .where(eq(buyerProfiles.userId, userId))
    .limit(1);
  return profile || null;
};

/**
 * Upsert buyer profile (creates if not existing, updates if already present)
 * @param {string} userId
 * @param {object} buyerData
 * @returns {Promise<object>}
 */
export const upsertBuyer = async (userId, buyerData) => {
  const existing = await findBuyerByUserId(userId);
  const now = new Date();

  if (existing) {
    const [updated] = await db
      .update(buyerProfiles)
      .set({
        ...buyerData,
        updatedAt: now,
      })
      .where(eq(buyerProfiles.userId, userId))
      .returning();
    return updated;
  }

  const profileId = buyerData.id || `BP_${crypto.randomInt(100000, 999999)}`;
  const [created] = await db
    .insert(buyerProfiles)
    .values({
      id: profileId,
      userId,
      ...buyerData,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return created;
};

/**
 * Find seller profile by user ID
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
export const findSellerByUserId = async (userId) => {
  const [profile] = await db
    .select()
    .from(sellerProfiles)
    .where(eq(sellerProfiles.userId, userId))
    .limit(1);
  return profile || null;
};

/**
 * Find seller profile by user ID joined with authoritative seller_categories and membership_plans
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
export const findSellerWithCategories = async (userId) => {
  const profile = await findSellerByUserId(userId);
  if (!profile) return null;

  const rawCats = Array.isArray(profile.sellerType)
    ? profile.sellerType
    : typeof profile.sellerType === 'string'
      ? profile.sellerType.replace(/[{}]/g, '').split(',').map((s) => s.trim()).filter(Boolean)
      : [];

  let connectedCategories = [];
  if (rawCats.length > 0) {
    connectedCategories = await db
      .select({
        id: sellerCategories.id,
        code: sellerCategories.code,
        name: sellerCategories.name,
        planId: sellerCategories.planId,
        requiredDocuments: sellerCategories.requiredDocuments,
        planName: membershipPlans.name,
        priceInPaise: membershipPlans.priceInPaise,
        currency: membershipPlans.currency,
        durationDays: membershipPlans.durationDays,
      })
      .from(sellerCategories)
      .innerJoin(membershipPlans, eq(sellerCategories.planId, membershipPlans.id))
      .where(or(inArray(sellerCategories.id, rawCats), inArray(sellerCategories.code, rawCats)));
  }

  return {
    ...profile,
    connectedCategories,
  };
};

/**
 * Upsert seller profile (creates if not existing, updates if already present)
 * @param {string} userId
 * @param {object} sellerData
 * @returns {Promise<object>}
 */
export const upsertSeller = async (userId, sellerData) => {
  const existing = await findSellerByUserId(userId);
  const now = new Date();

  // Normalize sellerType into array if passed as string
  const formattedData = { ...sellerData };
  if (formattedData.sellerType !== undefined && !Array.isArray(formattedData.sellerType)) {
    if (typeof formattedData.sellerType === 'string') {
      const trimmed = formattedData.sellerType.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        formattedData.sellerType = trimmed.slice(1, -1).split(',').map((s) => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
      } else {
        formattedData.sellerType = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
  }

  if (existing) {
    const [updated] = await db
      .update(sellerProfiles)
      .set({
        ...formattedData,
        updatedAt: now,
      })
      .where(eq(sellerProfiles.userId, userId))
      .returning();
    return updated;
  }

  const profileId = formattedData.id || `SP_${crypto.randomInt(100000, 999999)}`;
  const [created] = await db
    .insert(sellerProfiles)
    .values({
      id: profileId,
      userId,
      ...formattedData,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return created;
};


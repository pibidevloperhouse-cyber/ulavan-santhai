import { eq, and, inArray, sql } from 'drizzle-orm';
import { db } from '../config/db.js';
import { sellerCategories, membershipPlans } from '../models/schema.js';

/**
 * Repository: Seller Categories Data Access Layer
 * Interacts with public.seller_categories joined with public.membership_plans in Supabase PostgreSQL
 */

/**
 * Retrieve all active seller categories with their linked membership plans
 * @returns {Promise<Array<object>>}
 */
export const findAllActiveWithPlans = async () => {
  return await db
    .select({
      id: sellerCategories.id,
      code: sellerCategories.code,
      name: sellerCategories.name,
      planId: sellerCategories.planId,
      requiredDocuments: sellerCategories.requiredDocuments,
      isActive: sellerCategories.isActive,
      planName: membershipPlans.name,
      planRole: membershipPlans.role,
      priceInPaise: membershipPlans.priceInPaise,
      currency: membershipPlans.currency,
      durationDays: membershipPlans.durationDays,
    })
    .from(sellerCategories)
    .innerJoin(membershipPlans, eq(sellerCategories.planId, membershipPlans.id))
    .where(and(eq(sellerCategories.isActive, true), eq(membershipPlans.isActive, true)));
};

/**
 * Find seller categories matching an array of category codes or names, with joined plan details
 * @param {Array<string>} codesOrNames
 * @returns {Promise<Array<object>>}
 */
export const findByCodesOrNamesWithPlans = async (codesOrNames = []) => {
  if (!Array.isArray(codesOrNames) || codesOrNames.length === 0) {
    return [];
  }

  // Normalize incoming strings to trimmed lower-case for robust matching
  const normalizedSet = new Set(
    codesOrNames.map((s) => String(s || '').trim().toLowerCase()).filter(Boolean)
  );

  if (normalizedSet.size === 0) {
    return [];
  }

  // Fetch all active categories with plans to perform clean matching
  const activeCategories = await findAllActiveWithPlans();

  return activeCategories.filter((cat) => {
    const idMatch = normalizedSet.has(String(cat.id || '').trim().toLowerCase());
    const codeMatch = normalizedSet.has(String(cat.code || '').trim().toLowerCase());
    const nameMatch = normalizedSet.has(String(cat.name || '').trim().toLowerCase());
    return idMatch || codeMatch || nameMatch;
  });
};

/**
 * Find an active category by exact code
 * @param {string} code
 * @returns {Promise<object|null>}
 */
export const findByCodeWithPlan = async (code) => {
  if (!code) return null;
  const normalized = String(code).trim().toLowerCase();
  const all = await findAllActiveWithPlans();
  return (
    all.find(
      (c) =>
        String(c.code).trim().toLowerCase() === normalized ||
        String(c.name).trim().toLowerCase() === normalized
    ) || null
  );
};

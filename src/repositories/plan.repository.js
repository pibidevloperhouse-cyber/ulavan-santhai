import { eq, and } from 'drizzle-orm';
import { db } from '../config/db.js';
import { membershipPlans } from '../models/schema.js';

/**
 * Repository: Membership Plans Data Access Layer
 * Interacts directly with public.membership_plans in Supabase PostgreSQL
 */

/**
 * Find an active membership plan by its unique ID
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export const findActiveById = async (id) => {
  if (!id) return null;
  const normalizedId = String(id).trim().toUpperCase();
  const [plan] = await db
    .select()
    .from(membershipPlans)
    .where(and(eq(membershipPlans.id, normalizedId), eq(membershipPlans.isActive, true)))
    .limit(1);
  return plan || null;
};

/**
 * Find plan by ID regardless of active status (for historical lookups)
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export const findById = async (id) => {
  if (!id) return null;
  const normalizedId = String(id).trim().toUpperCase();
  const [plan] = await db
    .select()
    .from(membershipPlans)
    .where(eq(membershipPlans.id, normalizedId))
    .limit(1);
  return plan || null;
};

/**
 * Retrieve all active plans, optionally filtered by role
 * @param {string} [role]
 * @returns {Promise<Array<object>>}
 */
export const findAllActive = async (role) => {
  if (role) {
    const normalizedRole = String(role).trim().toUpperCase();
    return await db
      .select()
      .from(membershipPlans)
      .where(and(eq(membershipPlans.isActive, true), eq(membershipPlans.role, normalizedRole)));
  }
  return await db
    .select()
    .from(membershipPlans)
    .where(eq(membershipPlans.isActive, true));
};

/**
 * Get the default active plan for a given role (e.g., 'SELLER')
 * @param {string} [role='SELLER']
 * @returns {Promise<object|null>}
 */
export const getDefaultPlan = async (role = 'SELLER') => {
  const normalizedRole = String(role).trim().toUpperCase();
  const [plan] = await db
    .select()
    .from(membershipPlans)
    .where(and(eq(membershipPlans.isActive, true), eq(membershipPlans.role, normalizedRole)))
    .limit(1);
  return plan || null;
};

/**
 * Create or seed a new membership plan
 * @param {object} planData
 * @returns {Promise<object>}
 */
export const create = async (planData) => {
  const [created] = await db
    .insert(membershipPlans)
    .values({
      ...planData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: membershipPlans.id,
      set: {
        ...planData,
        updatedAt: new Date(),
      },
    })
    .returning();
  return created;
};

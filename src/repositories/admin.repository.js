import { eq } from 'drizzle-orm';
import { db } from '../config/db.js';
import { adminUsers } from '../models/schema.js';

/**
 * Repository: Admin Users Data Access Layer
 * Encapsulates all database operations on public.admin_users.
 */

/**
 * Find admin by normalized email address
 * @param {string} email
 * @returns {Promise<object|null>}
 */
export const findByEmail = async (email) => {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, cleanEmail))
    .limit(1);

  return admin || null;
};

/**
 * Find admin by primary key ID
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export const findById = async (id) => {
  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.id, id))
    .limit(1);

  return admin || null;
};

/**
 * Create a new admin user record
 * @param {object} adminData
 * @returns {Promise<object>}
 */
export const create = async (adminData) => {
  const [created] = await db
    .insert(adminUsers)
    .values({
      ...adminData,
      createdAt: adminData.createdAt || new Date(),
      updatedAt: adminData.updatedAt || new Date(),
    })
    .returning();

  return created;
};

/**
 * Update admin record
 * @param {string} id
 * @param {object} updateData
 * @returns {Promise<object>}
 */
export const update = async (id, updateData) => {
  const [updated] = await db
    .update(adminUsers)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(adminUsers.id, id))
    .returning();

  return updated;
};

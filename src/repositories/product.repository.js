import crypto from 'node:crypto';
import { eq, and, desc, ilike, or, sql } from 'drizzle-orm';
import { db } from '../config/db.js';
import { products, productCategories } from '../models/schema.js';

/**
 * Repository: Product Data Access Layer
 * Encapsulates all database operations on 'products' and 'product_categories'.
 */

/**
 * Insert a new product record
 * @param {object} productData
 * @returns {Promise<object>}
 */
export const create = async (productData) => {
  const now = new Date();
  const [created] = await db
    .insert(products)
    .values({
      ...productData,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return created;
};

/**
 * Find product by primary ID
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export const findById = async (id) => {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  return product || null;
};

/**
 * Find products for a specific seller with optional filters (search, category, status, availability)
 * @param {string} sellerId
 * @param {object} [filters]
 * @returns {Promise<Array<object>>}
 */
export const findBySeller = async (sellerId, filters = {}) => {
  const conditions = [eq(products.sellerId, sellerId)];

  if (filters.category && filters.category !== 'All' && filters.category !== 'All categories') {
    conditions.push(eq(products.category, filters.category));
  }

  if (filters.status && filters.status !== 'All' && filters.status !== 'All statuses') {
    conditions.push(eq(products.status, filters.status.toUpperCase()));
  }

  if (filters.search && filters.search.trim()) {
    const term = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        ilike(products.name, term),
        ilike(products.productType, term),
        ilike(products.variety, term)
      )
    );
  }

  const query = db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(desc(products.createdAt));

  const results = await query;

  // Filter availability in-memory or from moq JSONB if specified
  if (filters.availability && filters.availability !== 'All') {
    return results.filter((p) => {
      const avail = p.moq?.availability || '';
      return avail.toLowerCase() === filters.availability.toLowerCase();
    });
  }

  return results;
};

/**
 * Update an existing product owned by the seller
 * @param {string} id
 * @param {string} sellerId
 * @param {object} updateData
 * @returns {Promise<object|null>}
 */
export const update = async (id, sellerId, updateData) => {
  const now = new Date();
  const [updated] = await db
    .update(products)
    .set({
      ...updateData,
      updatedAt: now,
    })
    .where(and(eq(products.id, id), eq(products.sellerId, sellerId)))
    .returning();
  return updated || null;
};

/**
 * Delete a product owned by the seller
 * @param {string} id
 * @param {string} sellerId
 * @returns {Promise<boolean>}
 */
export const deleteById = async (id, sellerId) => {
  const result = await db
    .delete(products)
    .where(and(eq(products.id, id), eq(products.sellerId, sellerId)))
    .returning();
  return result.length > 0;
};

/**
 * Fetch all active product categories from DB
 * @returns {Promise<Array<object>>}
 */
export const getActiveCategories = async () => {
  return db
    .select({
      id: productCategories.id,
      name: productCategories.name,
      description: productCategories.description,
    })
    .from(productCategories)
    .where(eq(productCategories.isActive, true))
    .orderBy(productCategories.name);
};

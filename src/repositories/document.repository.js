import { eq, and, desc } from 'drizzle-orm';
import { db } from '../config/db.js';
import { documents } from '../models/schema.js';

/**
 * Repository: Document Data Access Layer
 * Encapsulates all database operations on the 'documents' table.
 */

/**
 * Insert a new document metadata record
 * @param {object} docData
 * @returns {Promise<object>}
 */
export const create = async (docData) => {
  const [newDoc] = await db
    .insert(documents)
    .values({
      ...docData,
      createdAt: docData.createdAt || new Date(),
    })
    .returning();
  return newDoc;
};

/**
 * Find document record by document ID (e.g. DOC_123456)
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export const findById = async (id) => {
  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);
  return doc || null;
};

/**
 * Find document record strictly scoped to a specific userId (prevents cross-user access)
 * @param {string} id
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
export const findByIdAndUserId = async (id, userId) => {
  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, userId)))
    .limit(1);
  return doc || null;
};

/**
 * Find all documents uploaded by a specific user (newest first)
 * @param {string} userId
 * @returns {Promise<Array<object>>}
 */
export const findByUserId = async (userId) => {
  return db
    .select()
    .from(documents)
    .where(eq(documents.userId, userId))
    .orderBy(desc(documents.createdAt));
};

/**
 * Find document record by storagePath (prevents cross-user folder collision)
 * @param {string} storagePath
 * @returns {Promise<object|null>}
 */
export const findByStoragePath = async (storagePath) => {
  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.storagePath, storagePath))
    .limit(1);
  return doc || null;
};

/**
 * Find document by user and document type (e.g. BANK_PASSBOOK, ID_PROOF)
 * @param {string} userId
 * @param {string} documentType
 * @returns {Promise<object|null>}
 */
export const findByUserAndType = async (userId, documentType) => {
  const [doc] = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.userId, userId),
        eq(documents.documentType, documentType)
      )
    )
    .limit(1);
  return doc || null;
};


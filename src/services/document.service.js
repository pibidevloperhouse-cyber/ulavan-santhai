import crypto from 'node:crypto';
import * as documentRepository from '../repositories/document.repository.js';
import * as userRepository from '../repositories/user.repository.js';
import { supabase } from '../config/supabase.js';

const BUCKET_NAME = 'user_documents';

const sanitizeUserFolder = (user = {}, fallbackId = 'user') => {
  const rawName = user.name || user.username || fallbackId;
  return String(rawName).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_') || 'user';
};

const inferMimeType = (fileName = '') => {
  const lower = String(fileName).toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'application/octet-stream';
};

/**
 * Service: Upload Document to Supabase Storage & Record via documentRepository
 * Stored in public bucket under: user_documents/${userName}/${timestamp}_${fileName}
 * @param {object} input
 * @param {Express.Multer.File} input.file
 * @param {string} input.documentType
 * @param {object} input.user - Decoded user from JWT
 * @returns {Promise<object>}
 */
export const uploadDocumentService = async ({ file, documentType, user } = {}) => {
  if (!file) {
    const error = new Error('No file attached. Please provide a document file.');
    error.statusCode = 400;
    throw error;
  }

  const cleanDocType = String(documentType || '').trim();
  if (!cleanDocType) {
    const error = new Error('documentType is required (e.g. ID_PROOF, BANK_PASSBOOK).');
    error.statusCode = 400;
    throw error;
  }

  if (!user || !user.id) {
    const error = new Error('User authentication required.');
    error.statusCode = 401;
    throw error;
  }

  // 1. Format storage path with sanitized user name
  const sanitizedUserName = sanitizeUserFolder(user, user.id);
  const cleanOriginalName = String(file.originalname || 'document.bin').replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const storagePath = `${sanitizedUserName}/${timestamp}_${cleanOriginalName}`;

  console.log(`[DOCUMENT] Uploading file to Supabase Storage bucket '${BUCKET_NAME}': ${storagePath}`);

  // 2. Upload buffer to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (uploadError) {
    console.error('[STORAGE ERROR]', uploadError.message);
    const error = new Error(`Storage upload failed: ${uploadError.message}`);
    error.statusCode = 500;
    throw error;
  }

  // 3. Obtain permanent public URL
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath);

  const fileUrl = publicUrlData.publicUrl;

  // 4. Save metadata record into database via documentRepository
  const documentId = `DOC_${crypto.randomInt(100000, 999999)}`;
  const now = new Date();

  const docRecord = await documentRepository.create({
    id: documentId,
    userId: user.id,
    documentType: cleanDocType,
    fileName: file.originalname,
    fileUrl: fileUrl,
    storagePath: storagePath,
    fileSize: String(file.size),
    mimeType: file.mimetype,
    status: 'UPLOADED',
    createdAt: now,
  });

  console.log(`[DOC_REPO] Document record saved: ${docRecord.id} (${docRecord.documentType}) for user ${user.id}`);

  return {
    success: true,
    message: 'Document uploaded successfully',
    documentId: docRecord.id,
    url: docRecord.fileUrl,
    fileName: docRecord.fileName,
    documentType: docRecord.documentType,
    data: {
      documentId: docRecord.id,
      url: docRecord.fileUrl,
      fileName: docRecord.fileName,
      documentType: docRecord.documentType,
      storagePath: docRecord.storagePath,
      fileSize: docRecord.fileSize,
      mimeType: docRecord.mimeType,
    },
  };
};

/**
 * Service: Fetch all uploaded documents strictly for a single userId
 * Reads from 'documents' table (user_id = userId) and reconciles with
 * that user's folder inside Supabase Storage bucket 'user_documents'.
 * Generates fresh signed URLs and backend stream preview URLs.
 * @param {string} userId
 * @returns {Promise<Array<object>>}
 */
export const getUserDocumentsService = async (userId) => {
  const cleanUserId = String(userId || '').trim();
  if (!cleanUserId) {
    const error = new Error('userId is required to fetch user documents.');
    error.statusCode = 400;
    throw error;
  }

  const [dbDocs, user] = await Promise.all([
    documentRepository.findByUserId(cleanUserId),
    userRepository.findById(cleanUserId),
  ]);

  const seenPaths = new Set();
  const resolvedDocs = [];

  for (const doc of dbDocs) {
    if (doc.storagePath) seenPaths.add(doc.storagePath);

    let signedUrl = null;
    if (doc.storagePath) {
      const { data: signedData } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(doc.storagePath, 3600);
      signedUrl = signedData?.signedUrl || null;
    }

    const mimeType = doc.mimeType || inferMimeType(doc.fileName || doc.storagePath);
    const previewUrl = `/api/v1/documents/${encodeURIComponent(doc.id)}/view?userId=${encodeURIComponent(cleanUserId)}`;

    resolvedDocs.push({
      id: doc.id,
      documentId: doc.id,
      userId: doc.userId,
      documentType: doc.documentType,
      name: doc.documentType,
      number: doc.id,
      fileName: doc.fileName,
      storagePath: doc.storagePath,
      mimeType,
      fileSize: doc.fileSize,
      status: doc.status || 'UPLOADED',
      authority: 'Verified Upload',
      validity: doc.status || 'Uploaded',
      url: signedUrl || doc.fileUrl,
      publicUrl: doc.fileUrl,
      signedUrl,
      previewUrl,
      createdAt: doc.createdAt,
    });
  }

  // Reconcile any files residing directly in user_documents/${sanitizedUserName} not tracked in DB
  if (user) {
    const folder = sanitizeUserFolder(user, cleanUserId);
    const { data: bucketFiles, error: listErr } = await supabase.storage
      .from(BUCKET_NAME)
      .list(folder, { limit: 100 });

    if (!listErr && Array.isArray(bucketFiles)) {
      for (const fileObj of bucketFiles) {
        if (!fileObj?.name || fileObj.id === null) continue;
        const storagePath = `${folder}/${fileObj.name}`;
        if (seenPaths.has(storagePath)) continue;

        // Prevent cross-user leakage if two different users happen to share the same sanitized name
        const ownerRecord = await documentRepository.findByStoragePath(storagePath);
        if (ownerRecord && ownerRecord.userId !== cleanUserId) continue;

        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(storagePath);
        const { data: signedData } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(storagePath, 3600);

        const mimeType = fileObj.metadata?.mimetype || inferMimeType(fileObj.name);
        const previewUrl = `/api/v1/documents/storage/view?userId=${encodeURIComponent(cleanUserId)}&path=${encodeURIComponent(storagePath)}`;

        resolvedDocs.push({
          id: `STG_${fileObj.name.slice(0, 16)}`,
          documentId: null,
          userId: cleanUserId,
          documentType: 'UPLOADED_DOCUMENT',
          name: fileObj.name.replace(/^\d+_/, ''),
          number: fileObj.name,
          fileName: fileObj.name,
          storagePath,
          mimeType,
          fileSize: String(fileObj.metadata?.size || ''),
          status: 'STORED',
          authority: 'User Documents Bucket',
          validity: 'Stored',
          url: signedData?.signedUrl || publicUrlData.publicUrl,
          publicUrl: publicUrlData.publicUrl,
          signedUrl: signedData?.signedUrl || null,
          previewUrl,
          createdAt: fileObj.created_at || null,
        });
      }
    }
  }

  return resolvedDocs;
};

/**
 * Service: Download / stream a single document from 'user_documents' bucket
 * Strictly verifies ownership against the requested userId when provided.
 * @param {object} input
 * @param {string} input.documentId
 * @param {string} [input.userId]
 * @param {string} [input.storagePath]
 * @returns {Promise<{ buffer: Buffer, mimeType: string, fileName: string }>}
 */
export const viewDocumentService = async ({ documentId, userId, storagePath } = {}) => {
  const cleanDocId = String(documentId || '').trim();
  const cleanUserId = String(userId || '').trim();
  let targetPath = '';
  let fileName = 'document';
  let mimeType = 'application/octet-stream';

  if (cleanDocId === 'storage' && storagePath) {
    if (!cleanUserId) {
      const error = new Error('userId is required to inspect storage document.');
      error.statusCode = 400;
      throw error;
    }
    const user = await userRepository.findById(cleanUserId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    const folder = sanitizeUserFolder(user, cleanUserId);
    const normalizedPath = String(storagePath).replace(/^\/+/, '');
    if (!normalizedPath.startsWith(`${folder}/`)) {
      const error = new Error('Access denied: document path does not belong to this user.');
      error.statusCode = 403;
      throw error;
    }
    targetPath = normalizedPath;
    fileName = normalizedPath.split('/').pop() || 'document';
    mimeType = inferMimeType(fileName);
  } else {
    const doc = cleanUserId
      ? await documentRepository.findByIdAndUserId(cleanDocId, cleanUserId)
      : await documentRepository.findById(cleanDocId);

    if (!doc) {
      const error = new Error('Document not found for the specified user.');
      error.statusCode = 404;
      throw error;
    }

    targetPath = doc.storagePath;
    fileName = doc.fileName || doc.storagePath?.split('/').pop() || 'document';
    mimeType = doc.mimeType || inferMimeType(fileName);
  }

  const { data: blob, error: downloadError } = await supabase.storage
    .from(BUCKET_NAME)
    .download(targetPath);

  if (downloadError || !blob) {
    const error = new Error(`Failed to read document from storage: ${downloadError?.message || 'File not found'}`);
    error.statusCode = 404;
    throw error;
  }

  const arrayBuffer = await blob.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    mimeType,
    fileName,
  };
};

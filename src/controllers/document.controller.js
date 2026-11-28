import * as documentService from '../services/document.service.js';
import { assertAuthenticated } from '../utils/authGuard.js';

/**
 * Controller: Upload KYC or Bank Document to Supabase Storage (Gate 2 Guarded)
 * @route POST /api/v1/documents/upload
 */
export const uploadDocument = async (req, res, next) => {
  try {
    // Gate 2 Assertion: Re-verify JWT and authenticate user identity
    const authUser = assertAuthenticated(req);

    const result = await documentService.uploadDocumentService({
      file: req.file,
      documentType: req.body.documentType,
      user: authUser,
      userId: authUser.id,
    });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to upload document.',
    });
  }
};

/**
 * Controller: Fetch all documents uploaded by a specific user (user-wise)
 * @route GET /api/v1/documents/user/:userId
 * @route GET /api/v1/admin/sellers/:userId/documents
 */
export const getUserDocuments = async (req, res) => {
  try {
    const { userId } = req.params;
    const docs = await documentService.getUserDocumentsService(userId);
    return res.status(200).json({
      success: true,
      userId,
      count: docs.length,
      data: docs,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch user documents.',
    });
  }
};

/**
 * Controller: Stream / preview a specific user document inline from 'user_documents' bucket
 * @route GET /api/v1/documents/:id/view
 */
export const viewDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, path: storagePath } = req.query;

    const { buffer, mimeType, fileName } = await documentService.viewDocumentService({
      documentId: id,
      userId,
      storagePath,
    });

    const safeFileName = String(fileName || 'document').replace(/[\r\n"]/g, '_');
    res.setHeader('Content-Type', mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${safeFileName}"`);
    res.setHeader('Cache-Control', 'private, max-age=300');
    return res.status(200).send(buffer);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to load document preview.',
    });
  }
};

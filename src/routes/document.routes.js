import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { uploadDocument, getUserDocuments, viewDocument } from '../controllers/document.controller.js';

const router = Router();

// Route 1: Document Upload (KYC, Bank Passbook, Farm Proof)
// Endpoints: POST /api/v1/documents/upload & POST /api/documents/upload
router.post('/upload', verifyToken, upload.single('file'), uploadDocument);

// Route 2: Fetch user-wise documents strictly scoped to userId
// Endpoints: GET /api/v1/documents/user/:userId & GET /api/documents/user/:userId
router.get('/user/:userId', getUserDocuments);

// Route 3: Stream / Preview single document inline from 'user_documents' bucket
// Endpoints: GET /api/v1/documents/:id/view & GET /api/documents/:id/view
router.get('/:id/view', viewDocument);

export default router;


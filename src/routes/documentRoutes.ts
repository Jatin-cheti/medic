import { Router } from 'express';
import DocumentController from '../controllers/documentController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

router.post('/upload', authMiddleware(['Admin', 'Super Admin']), DocumentController.uploadDocument);
router.post('/verify', authMiddleware(['Admin', 'Super Admin']), DocumentController.verifyDocument);
router.get('/', authMiddleware(['Admin', 'Super Admin']), DocumentController.getDocuments);

export default router;

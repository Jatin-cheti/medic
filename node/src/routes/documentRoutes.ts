import { Router } from 'express';
import multer from 'multer';
import { uploadDocuments } from '../controllers/documentController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', authenticate, upload.array('documents'), uploadDocuments);

export default router;

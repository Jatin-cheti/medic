import { Router } from 'express';
import PrescriptionController from '../controllers/PrescriptionController';
import { authenticateJWT } from '../middleware/authMiddleware';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.post('/prescriptions', authenticateJWT, upload.single('prescriptionImage'), PrescriptionController.savePrescription);

export default router;

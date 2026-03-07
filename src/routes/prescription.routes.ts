import { Router } from 'express';
import multer from 'multer';
import PrescriptionController from '../controllers/prescription.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();
const upload = multer({ dest: 'uploads/prescriptions/' });

router.post('/prescriptions', authenticateJWT, upload.single('prescriptionImage'), PrescriptionController.savePrescription);

export default router;

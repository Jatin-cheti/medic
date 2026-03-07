import { Router } from 'express';
import multer from 'multer';
import PrescriptionController from '../controllers/prescription.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { uploadPrescriptionSchema } from '../validations/prescription.validation';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), validateRequest(uploadPrescriptionSchema), PrescriptionController.uploadPrescription);
router.get('/:userId', PrescriptionController.getPrescriptions);

export default router;

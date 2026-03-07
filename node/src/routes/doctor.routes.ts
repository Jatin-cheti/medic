import { Router } from 'express';
import { DoctorController } from '../controllers/doctor.controller';
import { validateRequest } from '../middlewares/validateRequest.middleware';
import { setConsultationRateSchema } from '../validations/doctor.validation';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const doctorController = new DoctorController();

/**
 * @route PUT /api/doctor/rate
 * @desc Set consultation rate for a doctor
 * @access Private (Doctor only)
 */
router.put(
  '/rate',
  authenticate(['Doctor']),
  validateRequest(setConsultationRateSchema),
  doctorController.setConsultationRate
);

export default router;

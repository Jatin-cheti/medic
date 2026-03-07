import { Router } from 'express';
import { setConsultationRateController, getConsultationRateController } from '../controllers/doctorController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.put('/doctors/:id/rate', authenticateJWT, setConsultationRateController);
router.get('/doctors/:id/rate', authenticateJWT, getConsultationRateController);

export default router;

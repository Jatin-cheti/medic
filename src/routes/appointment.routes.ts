import { Router } from 'express';
import { bookAppointment, getAppointmentsByDoctorId } from '../controllers/appointment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authMiddleware, bookAppointment);
router.get('/doctor/:doctorId', getAppointmentsByDoctorId);

export default router;

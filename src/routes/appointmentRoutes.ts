import { Router } from 'express';
import AppointmentController from '../controllers/appointmentController';
import { validateAppointmentReminder } from '../middleware/validateAppointment';

const router = Router();

router.post('/reminder/:appointmentId', validateAppointmentReminder, AppointmentController.sendAppointmentReminder);

export default router;

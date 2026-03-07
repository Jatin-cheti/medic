import { Router } from 'express';
import { bookAppointment, getAppointments } from '../controllers/appointment.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

export const appointmentRouter = Router();

appointmentRouter.post('/', authMiddleware(['Patient']), bookAppointment);
appointmentRouter.get('/:userId', authMiddleware(['Patient', 'Doctor']), getAppointments);

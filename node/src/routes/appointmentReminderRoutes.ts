import express from 'express';
import { sendAppointmentReminder } from '../controllers/appointmentReminderController';
import { body } from 'express-validator';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = express.Router();

/**
 * POST /reminders
 * Send an appointment reminder
 * Access: Admin, Doctor
 */
router.post(
  '/reminders',
  authenticateJWT,
  authorizeRoles(['Admin', 'Doctor']),
  body('appointmentId').isInt().withMessage('Appointment ID must be a valid integer'),
  sendAppointmentReminder
);

export default router;

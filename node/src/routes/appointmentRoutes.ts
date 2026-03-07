import express from 'express';
import { getAppointments } from '../controllers/appointmentController';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @route   GET /appointments
 * @desc    Get upcoming or past appointments for the logged-in user
 * @access  Private
 */
router.get('/', authenticate, getAppointments);

export default router;

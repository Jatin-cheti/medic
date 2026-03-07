import express from 'express';
import { body } from 'express-validator';
import { DoctorDashboardController } from '../controllers/doctorDashboardController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = express.Router();
const doctorDashboardController = new DoctorDashboardController();

// Middleware to ensure the user is a doctor
const isDoctor = (req: any, res: any, next: any) => {
  if (req.user.role !== 'Doctor') {
    return res.status(403).json({ error: 'Access denied. Only doctors can access this resource.' });
  }
  next();
};

// Routes
router.get('/symptom-logs', authenticateJWT, isDoctor, doctorDashboardController.getSymptomCheckerLogs.bind(doctorDashboardController));

router.post(
  '/symptom-checker',
  authenticateJWT,
  isDoctor,
  body('symptoms').isArray({ min: 1 }).withMessage('Symptoms must be a non-empty array'),
  doctorDashboardController.querySymptomChecker.bind(doctorDashboardController)
);

export default router;

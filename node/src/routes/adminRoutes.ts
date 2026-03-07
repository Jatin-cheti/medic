import { Router } from 'express';
import { verifyDoctor } from '../controllers/adminController';
import { validateVerifyDoctor } from '../validators/adminValidator';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

router.post('/verify-doctor', authenticate, authorize(['Admin', 'SuperAdmin']), validateVerifyDoctor, verifyDoctor);

export default router;

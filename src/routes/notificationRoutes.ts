import { Router } from 'express';
import { createNotification, getNotifications } from '../controllers/notificationController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticate, createNotification);
router.get('/:doctorId', authenticate, getNotifications);

export default router;

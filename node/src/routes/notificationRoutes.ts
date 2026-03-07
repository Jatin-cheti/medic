import { Router } from 'express';
import notificationController from '../controllers/notificationController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticate, notificationController.getNotifications);
router.patch('/:notificationId/read', authenticate, notificationController.markAsRead);

export default router;

import { Router } from 'express';
import { createNotificationController, getNotificationsController } from '../controllers/notification.controller';
import { validateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', validateToken, createNotificationController);
router.get('/:doctorId', validateToken, getNotificationsController);

export default router;

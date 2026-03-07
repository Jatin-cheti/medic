import { Router } from 'express';
import UserController from '../controllers/userController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

router.get('/:role', authMiddleware(['Admin', 'SuperAdmin']), UserController.getUsersByRole);

export default router;

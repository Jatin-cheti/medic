import { Router } from 'express';
import { createAdmin, getAdmins, deleteAdmin } from '../controllers/adminController';
import { authenticateJWT, authorizeSuperAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authenticateJWT, authorizeSuperAdmin, createAdmin);
router.get('/', authenticateJWT, authorizeSuperAdmin, getAdmins);
router.delete('/:id', authenticateJWT, authorizeSuperAdmin, deleteAdmin);

export default router;

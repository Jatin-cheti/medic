import { Router } from 'express';
import SuperAdminController from '../controllers/superadmin.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/add-admin', authenticate(['SuperAdmin']), SuperAdminController.addAdmin);
router.delete('/remove-admin/:adminId', authenticate(['SuperAdmin']), SuperAdminController.removeAdmin);

export default router;

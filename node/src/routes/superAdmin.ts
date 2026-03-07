import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';
import { SuperAdminController } from '../controllers/superAdminController';

const router = Router();

router.post(
  '/add-admin',
  authenticateJWT,
  authorizeRoles('SuperAdmin'),
  SuperAdminController.addAdmin
);

router.delete(
  '/remove-admin/:id',
  authenticateJWT,
  authorizeRoles('SuperAdmin'),
  SuperAdminController.removeAdmin
);

export { router as superAdminRouter };

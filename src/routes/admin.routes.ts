import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateJWT, authorizeRole } from '../middlewares/auth.middleware';
import { body, param } from 'express-validator';

const router = Router();
const adminController = new AdminController();

router.post(
  '/add-admin',
  authenticateJWT,
  authorizeRole(['SuperAdmin']),
  [
    body('name').isString().notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
  ],
  adminController.addAdmin
);

router.delete(
  '/remove-admin/:adminId',
  authenticateJWT,
  authorizeRole(['SuperAdmin']),
  [param('adminId').isInt()],
  adminController.removeAdmin
);

export default router;

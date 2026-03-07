import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { validateAdmin, validateSuperAdmin } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { verifyDoctorSchema, addAdminSchema } from '../validations/admin.validation';

const router = Router();
const adminController = new AdminController();

router.get('/users', validateAdmin, adminController.getAllUsers);
router.post('/verify-doctor', validateAdmin, validateRequest(verifyDoctorSchema), adminController.verifyDoctor);
router.post('/add-admin', validateSuperAdmin, validateRequest(addAdminSchema), adminController.addAdmin);

export default router;

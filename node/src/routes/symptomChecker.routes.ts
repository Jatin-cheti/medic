import { Router } from 'express';
import { validateSymptomCheckerRequest } from '../middlewares/validation.middleware';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { SymptomCheckerController } from '../controllers/symptomChecker.controller';

const router = Router();
const symptomCheckerController = new SymptomCheckerController();

// POST /symptom-checker
router.post(
  '/',
  authenticateJWT,
  validateSymptomCheckerRequest,
  symptomCheckerController.checkSymptoms
);

export default router;

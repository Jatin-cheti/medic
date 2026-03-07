import { Router } from 'express';
import { SymptomCheckerController } from '../controllers/symptomCheckerController';
import { validateSymptomInput } from '../middlewares/validationMiddleware';

const router = Router();
const symptomCheckerController = new SymptomCheckerController();

router.post('/check', validateSymptomInput, symptomCheckerController.checkSymptoms.bind(symptomCheckerController));

export default router;

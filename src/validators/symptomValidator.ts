import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateSymptomInput = [
  body('symptoms').isArray().withMessage('Symptoms must be an array'),
  body('symptoms.*.name').isString().withMessage('Symptom name must be a string'),
  body('symptoms.*.description').isString().withMessage('Symptom description must be a string'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

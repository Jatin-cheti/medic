import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateSymptomCheckerRequest = [
  body('symptoms')
    .isArray({ min: 1 })
    .withMessage('Symptoms must be an array with at least one symptom.')
    .bail()
    .custom((symptoms) => symptoms.every((symptom: any) => typeof symptom === 'string'))
    .withMessage('Each symptom must be a string.'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

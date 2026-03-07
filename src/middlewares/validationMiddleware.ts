import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateSymptomInput = [
    body('symptoms').isArray().withMessage('Symptoms must be an array'),
    body('symptoms.*').isString().withMessage('Each symptom must be a string'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

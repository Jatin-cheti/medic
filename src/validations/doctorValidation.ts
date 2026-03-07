import { body } from 'express-validator';

export const uploadSymptomValidation = [
    body('symptom').notEmpty().withMessage('Symptom is required'),
];

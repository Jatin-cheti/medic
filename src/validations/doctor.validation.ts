import { query } from 'express-validator';

export const doctorQueryValidation = [
    query('specialty').optional().isString().withMessage('Specialty must be a string'),
];

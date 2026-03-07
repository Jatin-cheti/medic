import { body } from 'express-validator';

export const appointmentValidation = [
    body('doctorId').isNumeric().withMessage('Doctor ID must be a number'),
    body('patientId').isNumeric().withMessage('Patient ID must be a number'),
    body('appointmentType').isIn(['video', 'audio', 'physical']).withMessage('Invalid appointment type'),
    body('date').isISO8601().withMessage('Invalid date format'),
];

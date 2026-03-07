import { body, validationResult } from 'express-validator';

export const validateAppointmentReminder = [
    body('appointmentId').isString().withMessage('Appointment ID must be a string'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

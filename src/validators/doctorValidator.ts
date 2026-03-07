import { body, validationResult } from 'express-validator';

export const validateDoctorDashboard = [
  body('rate').isNumeric().withMessage('Rate must be a number.'),
];

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateVerifyDoctor = [
  body('doctorId').isInt().withMessage('Doctor ID must be an integer'),
  body('status').isIn(['Approved', 'Rejected']).withMessage('Status must be Approved or Rejected'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

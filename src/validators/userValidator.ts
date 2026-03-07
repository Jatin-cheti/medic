import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const validateUser = [
    body('username').isString().notEmpty(),
    body('password').isString().isLength({ min: 6 }),
    body('role').isIn(['patient', 'doctor', 'admin', 'superadmin']),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

export { validateUser };

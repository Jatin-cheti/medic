import { Request, Response, NextFunction } from 'express';

export const validateRole = (req: Request, res: Response, next: NextFunction) => {
    const allowedRoles = ['doctor', 'patient'];
    const { role } = req.params;

    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role specified.' });
    }
    next();
};

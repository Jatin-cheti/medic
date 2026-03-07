import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../utils/CustomError';

export const authorizeRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!roles.includes(userRole)) {
      return next(new CustomError('Access denied', 403));
    }

    next();
  };
};

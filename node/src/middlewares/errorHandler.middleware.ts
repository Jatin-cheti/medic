import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../errors/BaseError';

export const errorHandler = (err: BaseError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({ error: message });
};

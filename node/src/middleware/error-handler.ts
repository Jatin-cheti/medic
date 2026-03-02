import { NextFunction, Request, Response } from 'express';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`) as Error & { statusCode?: number };
  error.statusCode = 404;
  next(error);
}

export function errorHandler(err: Error & { statusCode?: number }, _req: Request, res: Response, _next: NextFunction) {
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  if (statusCode >= 500) {
    console.error('Unhandled server error:', err);
  }

  res.status(statusCode).json({
    error: message,
    message,
  });
}

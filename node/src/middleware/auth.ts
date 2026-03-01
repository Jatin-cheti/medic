import { Request, Response, NextFunction, RequestHandler } from 'express';
import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = (process.env.JWT_SECRET || 'please_change_me') as unknown as jwt.Secret;

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    uuid: string;
    email: string;
    phone: string;
    role: string;
  };
}

export const verifyToken: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const authReq = req as any as AuthenticatedRequest;
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

  console.log('verifyToken called, token present:', !!token, 'token length:', token?.length);

  if (!token) {
    res.status(401).json({ error: 'token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('Token verified successfully, decoded:', Object.keys(decoded));
    authReq.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ error: 'invalid token' });
    return;
  }
};

export const verifyRole = (allowedRoles: string[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as any as AuthenticatedRequest;
    
    if (!authReq.user) {
      res.status(401).json({ error: 'token required' });
      return;
    }

    if (!allowedRoles.includes(authReq.user.role)) {
      res.status(403).json({ error: 'insufficient permissions' });
      return;
    }

    next();
  };
};



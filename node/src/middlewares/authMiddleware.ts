import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/config';

// Direct middleware - verifies JWT only
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Authentication token is missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Alias for direct JWT verification
export const authenticateJWT = authenticate;

// Factory middleware - verifies JWT and checks roles
export const authMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication token is missing' });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
      req.user = decoded;
      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  };
};

// Alias for authMiddleware
export const authorize = authMiddleware;

// Variadic version: authorizeRoles('SuperAdmin') or authorizeRoles('Admin', 'Doctor')
export const authorizeRoles = (...roles: string[]) => authMiddleware(roles);

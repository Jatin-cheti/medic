import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/adminService';

export const verifyDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { doctorId, status, comments } = req.body;
    const result = await adminService.verifyDoctor(doctorId, status, comments);
    res.status(200).json({ message: result });
  } catch (error) {
    next(error);
  }
};

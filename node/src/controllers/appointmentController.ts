import { Request, Response, NextFunction } from 'express';
import { appointmentService } from '../services/appointmentService';

export const getAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id; // Extracted from JWT middleware
    const role = req.user.role; // Extracted from JWT middleware
    const { type } = req.query; // 'upcoming' or 'past'

    if (!type || (type !== 'upcoming' && type !== 'past')) {
      return res.status(400).json({ message: 'Invalid type parameter. Use "upcoming" or "past".' });
    }

    const appointments = await appointmentService.getAppointments(userId, role, type as string);
    res.status(200).json({ appointments });
  } catch (error) {
    next(error);
  }
};

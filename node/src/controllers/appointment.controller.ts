import { Request, Response, NextFunction } from 'express';
import { AppointmentService } from '../services/appointment.service';

export const bookAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { doctorId, patientId, type, date, time } = req.body;
    const appointment = await AppointmentService.createAppointment({ doctorId, patientId, type, date, time });
    res.status(201).json({ appointment });
  } catch (error) {
    next(error);
  }
};

export const getAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const appointments = await AppointmentService.getAppointmentsByUserId(Number(userId));
    res.json({ appointments });
  } catch (error) {
    next(error);
  }
};

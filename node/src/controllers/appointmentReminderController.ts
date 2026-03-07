import { Request, Response, NextFunction } from 'express';
import { sendAppointmentReminderService } from '../services/appointmentReminderService';
import { validationResult } from 'express-validator';

export const sendAppointmentReminder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { appointmentId } = req.body;

    // Call service layer to send reminder
    const result = await sendAppointmentReminderService(appointmentId);

    res.status(200).json({ message: 'Reminder sent successfully', result });
  } catch (error) {
    next(error);
  }
};

import { Request, Response } from 'express';
import AppointmentService from '../services/appointmentService';

class AppointmentController {
    async sendAppointmentReminder(req: Request, res: Response) {
        try {
            const { appointmentId } = req.params;
            const reminderStatus = await AppointmentService.sendReminder(appointmentId);
            res.status(200).json({ message: 'Reminder sent successfully', status: reminderStatus });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default new AppointmentController();

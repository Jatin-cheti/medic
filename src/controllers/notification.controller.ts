import { Request, Response } from 'express';
import { notifyDoctor, fetchDoctorNotifications } from '../services/notification.service';

export const createNotificationController = async (req: Request, res: Response) => {
    const { doctorId, message } = req.body;
    try {
        const notification = await notifyDoctor(doctorId, message);
        res.status(201).json({ success: true, notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getNotificationsController = async (req: Request, res: Response) => {
    const doctorId = Number(req.params.doctorId);
    try {
        const notifications = await fetchDoctorNotifications(doctorId);
        res.status(200).json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

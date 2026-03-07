import { Request, Response } from 'express';
import NotificationService from '../services/notificationService';

export const createNotification = async (req: Request, res: Response) => {
    try {
        const { doctorId, message } = req.body;
        const notification = await NotificationService.createNotification(doctorId, message);
        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const doctorId = req.params.doctorId;
        const notifications = await NotificationService.getNotificationsByDoctorId(doctorId);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

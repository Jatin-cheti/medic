import { createNotification, getNotificationsByDoctorId, Notification } from '../models/notification.model';

export const notifyDoctor = async (doctorId: number, message: string): Promise<Notification> => {
    return await createNotification(doctorId, message);
};

export const fetchDoctorNotifications = async (doctorId: number): Promise<Notification[]> => {
    return await getNotificationsByDoctorId(doctorId);
};

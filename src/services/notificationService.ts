import Notification from '../models/Notification';

class NotificationService {
    static async createNotification(doctorId: string, message: string) {
        const notification = new Notification({ doctorId, message });
        return await notification.save();
    }

    static async getNotificationsByDoctorId(doctorId: string) {
        return await Notification.find({ doctorId }).sort({ createdAt: -1 });
    }
}

export default NotificationService;

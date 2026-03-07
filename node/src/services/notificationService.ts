import Notification from '../models/Notification';

class NotificationService {
  async getNotifications(userId: number) {
    return await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
  }

  async createNotification(userId: number, type: 'statusUpdate' | 'appointmentReminder', message: string) {
    return await Notification.create({ userId, type, message });
  }

  async markAsRead(notificationId: number) {
    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }
    notification.isRead = true;
    await notification.save();
  }
}

export default new NotificationService();

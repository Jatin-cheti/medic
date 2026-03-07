import { Request, Response, NextFunction } from 'express';
import notificationService from '../services/notificationService';

class NotificationController {
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id; // Extract user ID from JWT
      const notifications = await notificationService.getNotifications(userId);
      res.status(200).json({ notifications });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { notificationId } = req.params;
      await notificationService.markAsRead(parseInt(notificationId, 10));
      res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();

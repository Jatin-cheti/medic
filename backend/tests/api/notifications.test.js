import request from 'supertest';
import app from '../../src/app'; // Assuming your Express app is exported from this file
import { NotificationService } from '../../src/services/notification.service';
import { mockDB } from '../../src/utils/mockDB'; // Mock database utility

jest.mock('../../src/services/notification.service');

describe('Notification System', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /notifications/send', () => {
    it('should send notification to doctor successfully', async () => {
      const mockSendNotification = jest.fn().mockResolvedValue({ message: 'Notification sent' });
      NotificationService.sendNotification = mockSendNotification;

      const response = await request(app)
        .post('/notifications/send')
        .send({ userId: 1, message: 'Your document has been approved' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Notification sent' });
      expect(mockSendNotification).toHaveBeenCalledWith(1, 'Your document has been approved');
    });

    it('should return error if userId is missing', async () => {
      const response = await request(app)
        .post('/notifications/send')
        .send({ message: 'Your document has been approved' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'User ID is required' });
    });

    it('should return error if notification sending fails', async () => {
      const mockSendNotification = jest.fn().mockRejectedValue(new Error('Failed to send notification'));
      NotificationService.sendNotification = mockSendNotification;

      const response = await request(app)
        .post('/notifications/send')
        .send({ userId: 1, message: 'Your document has been approved' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to send notification' });
    });
  });

  describe('GET /notifications/:userId', () => {
    it('should retrieve notifications for a user', async () => {
      const mockGetNotifications = jest.fn().mockResolvedValue([{ id: 1, message: 'Your appointment is confirmed' }]);
      NotificationService.getNotifications = mockGetNotifications;

      const response = await request(app)
        .get('/notifications/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ id: 1, message: 'Your appointment is confirmed' }]);
      expect(mockGetNotifications).toHaveBeenCalledWith(1);
    });

    it('should return error if userId is invalid', async () => {
      const response = await request(app)
        .get('/notifications/invalidId');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid user ID' });
    });

    it('should return empty array if no notifications found', async () => {
      const mockGetNotifications = jest.fn().mockResolvedValue([]);
      NotificationService.getNotifications = mockGetNotifications;

      const response = await request(app)
        .get('/notifications/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
      expect(mockGetNotifications).toHaveBeenCalledWith(1);
    });
  });
});

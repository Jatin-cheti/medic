import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NotificationService],
    });
    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('sendNotification', () => {
    it('should send notification successfully', () => {
      const mockResponse = { message: 'Notification sent' };
      service.sendNotification(1, 'Your document has been approved').subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/notifications/send');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should handle error when sending notification fails', () => {
      service.sendNotification(1, 'Your document has been approved').subscribe(
        () => fail('should have failed with 500 error'),
        (error) => {
          expect(error.status).toBe(500);
        }
      );

      const req = httpMock.expectOne('/notifications/send');
      req.flush('Sending failed', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getNotifications', () => {
    it('should retrieve notifications for a user', () => {
      const mockResponse = [{ id: 1, message: 'Your appointment is confirmed' }];
      service.getNotifications(1).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/notifications/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle error when retrieving notifications fails', () => {
      service.getNotifications(1).subscribe(
        () => fail('should have failed with 404 error'),
        (error) => {
          expect(error.status).toBe(404);
        }
      );

      const req = httpMock.expectOne('/notifications/1');
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });
});

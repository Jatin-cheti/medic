import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationListComponent } from './notification-list.component';
import { NotificationService } from '../../services/notification.service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('NotificationListComponent', () => {
  let component: NotificationListComponent;
  let fixture: ComponentFixture<NotificationListComponent>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('NotificationService', ['getNotifications']);

    TestBed.configureTestingModule({
      declarations: [NotificationListComponent],
      providers: [{ provide: NotificationService, useValue: spy }],
    });

    fixture = TestBed.createComponent(NotificationListComponent);
    component = fixture.componentInstance;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('ngOnInit', () => {
    it('should load notifications on init', () => {
      const mockNotifications = [{ id: 1, message: 'Your appointment is confirmed' }];
      notificationService.getNotifications.and.returnValue(of(mockNotifications));

      component.ngOnInit();

      expect(notificationService.getNotifications).toHaveBeenCalledWith(component.userId);
      expect(component.notifications).toEqual(mockNotifications);
    });

    it('should handle error when loading notifications fails', () => {
      notificationService.getNotifications.and.returnValue(throwError({ status: 404 }));

      component.ngOnInit();

      expect(notificationService.getNotifications).toHaveBeenCalledWith(component.userId);
      expect(component.notifications).toEqual([]);
      // Optionally check for an error message display
    });
  });

  describe('Template', () => {
    it('should display notifications', () => {
      component.notifications = [{ id: 1, message: 'Your appointment is confirmed' }];
      fixture.detectChanges();

      const notificationElement = fixture.debugElement.query(By.css('.notification'));
      expect(notificationElement.nativeElement.textContent).toContain('Your appointment is confirmed');
    });

    it('should display no notifications message when empty', () => {
      component.notifications = [];
      fixture.detectChanges();

      const noNotificationsElement = fixture.debugElement.query(By.css('.no-notifications'));
      expect(noNotificationsElement.nativeElement.textContent).toContain('No notifications available');
    });
  });
});

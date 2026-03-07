import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentListComponent } from './appointment-list.component';
import { AppointmentService } from '../../services/appointment.service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('AppointmentListComponent', () => {
  let component: AppointmentListComponent;
  let fixture: ComponentFixture<AppointmentListComponent>;
  let appointmentService: jasmine.SpyObj<AppointmentService>;

  beforeEach(async () => {
    const appointmentServiceSpy = jasmine.createSpyObj('AppointmentService', ['getAppointments', 'sendReminder']);

    await TestBed.configureTestingModule({
      declarations: [AppointmentListComponent],
      providers: [{ provide: AppointmentService, useValue: appointmentServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentListComponent);
    component = fixture.componentInstance;
    appointmentService = TestBed.inject(AppointmentService) as jasmine.SpyObj<AppointmentService>;
  });

  afterEach(() => {
    // Clean up state
    appointmentService.getAppointments.calls.reset();
    appointmentService.sendReminder.calls.reset();
  });

  describe('ngOnInit', () => {
    it('should load appointments on init', () => {
      const mockAppointments = [{ id: 1, type: 'Video', date: '2023-03-07', time: '10:00' }];
      appointmentService.getAppointments.and.returnValue(of(mockAppointments));

      component.ngOnInit();

      expect(appointmentService.getAppointments).toHaveBeenCalled();
      expect(component.appointments).toEqual(mockAppointments);
    });

    it('should handle error when loading appointments', () => {
      appointmentService.getAppointments.and.returnValue(throwError('Error loading appointments'));

      component.ngOnInit();

      expect(appointmentService.getAppointments).toHaveBeenCalled();
      expect(component.appointments).toBeUndefined();
      // You can also check for an error message if you have one
    });
  });

  describe('sendReminder', () => {
    it('should send reminder successfully', () => {
      const appointmentId = 1;
      appointmentService.sendReminder.and.returnValue(of({ message: 'Reminder sent successfully' }));

      component.sendReminder(appointmentId);

      expect(appointmentService.sendReminder).toHaveBeenCalledWith(appointmentId);
      // You can also check for a success message if you have one
    });

    it('should handle error when sending reminder', () => {
      const appointmentId = 1;
      appointmentService.sendReminder.and.returnValue(throwError('Error sending reminder'));

      component.sendReminder(appointmentId);

      expect(appointmentService.sendReminder).toHaveBeenCalledWith(appointmentId);
      // You can also check for an error message if you have one
    });
  });
});

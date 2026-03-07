import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DoctorListComponent } from './doctor-list.component';
import { AppointmentService } from '../../services/appointment.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DoctorListComponent', () => {
    let component: DoctorListComponent;
    let fixture: ComponentFixture<DoctorListComponent>;
    let appointmentService: jasmine.SpyObj<AppointmentService>;

    beforeEach(() => {
        const appointmentServiceSpy = jasmine.createSpyObj('AppointmentService', ['setConsultationRate']);

        TestBed.configureTestingModule({
            declarations: [DoctorListComponent],
            providers: [{ provide: AppointmentService, useValue: appointmentServiceSpy }],
            schemas: [NO_ERRORS_SCHEMA]
        });

        fixture = TestBed.createComponent(DoctorListComponent);
        component = fixture.componentInstance;
        appointmentService = TestBed.inject(AppointmentService) as jasmine.SpyObj<AppointmentService>;
    });

    afterEach(() => {
        // Clean up state after each test
        component.doctors = [];
    });

    it('should set consultation rate and show success message', () => {
        const doctorId = 1;
        const rate = 100;
        appointmentService.setConsultationRate.and.returnValue(of({ message: 'Consultation rate set successfully' }));

        component.setConsultationRate(doctorId, rate);

        expect(appointmentService.setConsultationRate).toHaveBeenCalledWith(doctorId, rate);
        expect(component.successMessage).toBe('Consultation rate set successfully');
    });

    it('should handle error when setting consultation rate', () => {
        const doctorId = 999; // Non-existing doctor ID
        const rate = 100;
        appointmentService.setConsultationRate.and.returnValue(throwError({ error: { message: 'Doctor not found' } }));

        component.setConsultationRate(doctorId, rate);

        expect(appointmentService.setConsultationRate).toHaveBeenCalledWith(doctorId, rate);
        expect(component.errorMessage).toBe('Doctor not found');
    });
});

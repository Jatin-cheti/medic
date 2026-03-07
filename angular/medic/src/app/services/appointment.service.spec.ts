import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppointmentService } from './appointment.service';

describe('AppointmentService', () => {
    let service: AppointmentService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AppointmentService]
        });
        service = TestBed.inject(AppointmentService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify(); // Ensure that no unmatched requests are outstanding
    });

    it('should set consultation rate successfully', () => {
        const doctorId = 1;
        const rate = 100;

        service.setConsultationRate(doctorId, rate).subscribe(response => {
            expect(response.message).toBe('Consultation rate set successfully');
        });

        const req = httpMock.expectOne(`/appointments/set-rate`);
        expect(req.request.method).toBe('POST');
        req.flush({ message: 'Consultation rate set successfully' });
    });

    it('should handle error when doctor does not exist', () => {
        const doctorId = 999; // Non-existing doctor ID
        const rate = 100;

        service.setConsultationRate(doctorId, rate).subscribe(
            () => {},
            error => {
                expect(error.error.message).toBe('Doctor not found');
            }
        );

        const req = httpMock.expectOne(`/appointments/set-rate`);
        expect(req.request.method).toBe('POST');
        req.flush({ message: 'Doctor not found' }, { status: 404, statusText: 'Not Found' });
    });

    it('should handle error when rate is invalid', () => {
        const doctorId = 1;
        const rate = -50; // Invalid rate

        service.setConsultationRate(doctorId, rate).subscribe(
            () => {},
            error => {
                expect(error.error.message).toBe('Invalid consultation rate');
            }
        );

        const req = httpMock.expectOne(`/appointments/set-rate`);
        expect(req.request.method).toBe('POST');
        req.flush({ message: 'Invalid consultation rate' }, { status: 400, statusText: 'Bad Request' });
    });
});

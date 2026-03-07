import { TestBed } from '@angular/core/testing';
import { DoctorService } from './doctor.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('DoctorService', () => {
  let service: DoctorService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DoctorService],
    });
    service = TestBed.inject(DoctorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Clean up after each test
  });

  describe('getApprovedDoctors', () => {
    it('should return an Observable of approved doctors', () => {
      const mockDoctors = [{ id: 1, name: 'Dr. Smith', specialization: 'Cardiology' }];

      service.getApprovedDoctors().subscribe(doctors => {
        expect(doctors).toEqual(mockDoctors);
      });

      const req = httpMock.expectOne('/doctors');
      expect(req.request.method).toBe('GET');
      req.flush(mockDoctors);
    });

    it('should handle error response', () => {
      service.getApprovedDoctors().subscribe(
        () => fail('should have failed with 404 error'),
        (error) => {
          expect(error.status).toBe(404;
        }
      );

      const req = httpMock.expectOne('/doctors');
      req.flush('404 error', { status: 404, statusText: 'Not Found' });
    });
  });
});

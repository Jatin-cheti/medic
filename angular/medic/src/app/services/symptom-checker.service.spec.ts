import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SymptomCheckerService } from './symptom-checker.service';

describe('SymptomCheckerService', () => {
  let service: SymptomCheckerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SymptomCheckerService],
    });

    service = TestBed.inject(SymptomCheckerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure that no unmatched requests are outstanding
  });

  describe('checkSymptoms', () => {
    it('should return diagnosis and recommendations for valid symptoms', () => {
      const symptoms = ['fever', 'cough'];
      const mockResponse = {
        diagnosis: 'Flu',
        recommendations: ['Rest', 'Hydration', 'Consult a doctor if symptoms persist'],
      };

      service.checkSymptoms(symptoms).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/symptom-checker');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse); // Simulate a successful response
    });

    it('should handle error response', () => {
      const symptoms = ['fever'];

      service.checkSymptoms(symptoms).subscribe(
        () => fail('should have failed with a 500 error'),
        (error) => {
          expect(error.status).toBe(500);
        }
      );

      const req = httpMock.expectOne('/symptom-checker');
      expect(req.request.method).toBe('POST');
      req.flush('Internal Server Error', { status: 500, statusText: 'Server Error' });
    });
  });
});

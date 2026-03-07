import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DocumentService } from './document.service';
import { Document } from '../models/document.model';

describe('DocumentService', () => {
  let service: DocumentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DocumentService]
    });
    service = TestBed.inject(DocumentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('uploadDocument', () => {
    it('should upload document successfully', () => {
      const mockDocument: Document = {
        userId: '12345',
        type: 'Certificate',
        filePath: 'path/to/certificate.pdf',
        uploadedAt: new Date()
      };

      service.uploadDocument(mockDocument).subscribe(response => {
        expect(response.message).toBe('Document uploaded successfully.');
      });

      const req = httpMock.expectOne('/documents/upload');
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'Document uploaded successfully.' });
    });

    it('should handle error when uploading document', () => {
      const mockDocument: Document = {
        userId: '12345',
        type: 'Certificate',
        filePath: 'path/to/certificate.pdf',
        uploadedAt: new Date()
      };

      service.uploadDocument(mockDocument).subscribe(
        () => fail('should have failed with a 500 error'),
        (error) => {
          expect(error.status).toBe(500);
          expect(error.error.message).toBe('Internal Server Error');
        }
      );

      const req = httpMock.expectOne('/documents/upload');
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'Internal Server Error' }, { status: 500, statusText: 'Server Error' });
    });
  });
});

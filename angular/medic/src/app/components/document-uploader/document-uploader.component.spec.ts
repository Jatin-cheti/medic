import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentUploaderComponent } from './document-uploader.component';
import { DocumentService } from '../../services/document.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DocumentUploaderComponent', () => {
  let component: DocumentUploaderComponent;
  let fixture: ComponentFixture<DocumentUploaderComponent>;
  let documentService: jasmine.SpyObj<DocumentService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('DocumentService', ['uploadDocument']);

    TestBed.configureTestingModule({
      declarations: [DocumentUploaderComponent],
      providers: [{ provide: DocumentService, useValue: spy }],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(DocumentUploaderComponent);
    component = fixture.componentInstance;
    documentService = TestBed.inject(DocumentService) as jasmine.SpyObj<DocumentService>;
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('upload', () => {
    it('should upload document and show success message', () => {
      documentService.uploadDocument.and.returnValue(of({ message: 'Document uploaded successfully.' }));

      component.upload();

      expect(documentService.uploadDocument).toHaveBeenCalled();
      expect(component.successMessage).toBe('Document uploaded successfully.');
    });

    it('should handle error during document upload', () => {
      documentService.uploadDocument.and.returnValue(throwError({ status: 500, error: { message: 'Upload failed' } }));

      component.upload();

      expect(documentService.uploadDocument).toHaveBeenCalled();
      expect(component.errorMessage).toBe('Upload failed');
    });
  });
});

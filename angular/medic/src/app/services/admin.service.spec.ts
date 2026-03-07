import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminService],
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add a new admin successfully', () => {
    const newAdmin = { name: 'New Admin', email: 'newadmin@example.com', password: 'newpassword' };

    service.addAdmin(newAdmin).subscribe(response => {
      expect(response.message).toBe('Admin added successfully');
    });

    const req = httpMock.expectOne('/admin/add-admin');
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'Admin added successfully' });
  });

  it('should handle error when adding an existing admin', () => {
    const existingAdmin = { name: 'Existing Admin', email: 'existingadmin@example.com', password: 'existingpassword' };

    service.addAdmin(existingAdmin).subscribe(
      () => {},
      (error) => {
        expect(error.error.message).toBe('Email already exists');
      }
    );

    const req = httpMock.expectOne('/admin/add-admin');
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'Email already exists' }, { status: 400, statusText: 'Bad Request' });
  });
});

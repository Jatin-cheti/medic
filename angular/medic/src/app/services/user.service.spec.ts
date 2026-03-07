import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('addAdmin', () => {
    it('should add a new admin successfully', () => {
      const newAdmin = { name: 'New Admin', email: 'newadmin@example.com', password: 'newadminpassword' };

      service.addAdmin(newAdmin).subscribe(response => {
        expect(response.message).toBe('Admin added successfully');
      });

      const req = httpMock.expectOne('/admin/add-admin');
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'Admin added successfully' });
    });

    it('should handle error when email is already taken', () => {
      const newAdmin = { name: 'Existing Admin', email: 'admin@example.com', password: 'newadminpassword' };

      service.addAdmin(newAdmin).subscribe(
        response => fail('should have failed with a 400 error'),
        (error: any) => {
          expect(error.error.message).toBe('Email already exists');
        }
      );

      const req = httpMock.expectOne('/admin/add-admin');
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'Email already exists' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('removeAdmin', () => {
    it('should remove an admin successfully', () => {
      const adminId = '12345';

      service.removeAdmin(adminId).subscribe(response => {
        expect(response.message).toBe('Admin removed successfully');
      });

      const req = httpMock.expectOne(`/admin/remove-admin/${adminId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'Admin removed successfully' });
    });

    it('should handle error when admin does not exist', () => {
      const adminId = 'nonexistentid';

      service.removeAdmin(adminId).subscribe(
        response => fail('should have failed with a 404 error'),
        (error: any) => {
          expect(error.error.message).toBe('Admin not found');
        }
      );

      const req = httpMock.expectOne(`/admin/remove-admin/${adminId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'Admin not found' }, { status: 404, statusText: 'Not Found' });
    });
  });
});

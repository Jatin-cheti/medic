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

  describe('registerUser', () => {
    it('should register a user successfully', () => {
      const userData = { username: 'newUser', password: 'password123', role: 'doctor' };

      service.registerUser(userData).subscribe(response => {
        expect(response.message).toBe('User registered successfully.');
      });

      const req = httpMock.expectOne('/api/auth/signup');
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'User registered successfully.' });
    });

    it('should handle error on registration failure', () => {
      const userData = { username: 'newUser', password: 'password123', role: 'doctor' };

      service.registerUser(userData).subscribe(
        () => fail('should have failed with a 400 error'),
        (error) => {
          expect(error.status).toBe(400);
        }
      );

      const req = httpMock.expectOne('/api/auth/signup');
      req.flush('Registration failed', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('loginUser', () => {
    it('should authenticate a user and return a token', () => {
      const credentials = { username: 'existingUser', password: 'password123' };

      service.loginUser(credentials).subscribe(response => {
        expect(response).toHaveProperty('token');
      });

      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      req.flush({ token: 'JWT_TOKEN', role: 'doctor' });
    });

    it('should handle error on invalid credentials', () => {
      const credentials = { username: 'wrongUser', password: 'wrongPassword' };

      service.loginUser(credentials).subscribe(
        () => fail('should have failed with a 401 error'),
        (error) => {
          expect(error.status).toBe(401);
        }
      );

      const req = httpMock.expectOne('/api/auth/login');
      req.flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });
    });
  });
});

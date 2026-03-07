import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { UserService } from '../services/user.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(() => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['loginUser']);

    TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [FormsModule],
      providers: [{ provide: UserService, useValue: userServiceSpy }]
    });

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should log in successfully and navigate to dashboard', () => {
      userService.loginUser.and.returnValue(of({ token: 'JWT_TOKEN', role: 'doctor' }));
      component.username = 'testUser';
      component.password = 'password123';

      component.login();

      expect(userService.loginUser).toHaveBeenCalledWith({ username: 'testUser', password: 'password123' });
      // Add navigation expectation here if using Router
    });

    it('should handle login error', () => {
      userService.loginUser.and.returnValue(throwError({ error: { message: 'Invalid credentials.' } }));
      component.username = 'wrongUser';
      component.password = 'wrongPassword';

      component.login();

      expect(userService.loginUser).toHaveBeenCalledWith({ username: 'wrongUser', password: 'wrongPassword' });
      expect(component.errorMessage).toBe('Invalid credentials.');
    });
  });
});

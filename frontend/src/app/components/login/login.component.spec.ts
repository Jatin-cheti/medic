import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { UserService } from '../../services/user.service';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(() => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['loginUser']);

    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [LoginComponent],
      providers: [{ provide: UserService, useValue: userServiceSpy }]
    });

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('onSubmit', () => {
    it('should call loginUser and navigate on success', () => {
      userService.loginUser.and.returnValue(of({ token: 'JWT_TOKEN', role: 'doctor' }));

      component.username = 'existingUser';
      component.password = 'password123';
      component.onSubmit();

      expect(userService.loginUser).toHaveBeenCalledWith({ username: 'existingUser', password: 'password123' });
      // Add navigation logic check if applicable
    });

    it('should handle error on login failure', () => {
      userService.loginUser.and.returnValue(throwError({ status: 401 }));

      component.username = 'wrongUser';
      component.password = 'wrongPassword';
      component.onSubmit();

      expect(userService.loginUser).toHaveBeenCalledWith({ username: 'wrongUser', password: 'wrongPassword' });
      // Add error handling logic check if applicable
    });
  });
});

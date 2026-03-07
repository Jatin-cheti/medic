import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { UserService } from '../../services/user.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(() => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['addAdmin', 'removeAdmin']);

    TestBed.configureTestingModule({
      declarations: [AdminDashboardComponent],
      providers: [{ provide: UserService, useValue: userServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  afterEach(() => {
    userService.addAdmin.calls.reset();
    userService.removeAdmin.calls.reset();
  });

  describe('addAdmin', () => {
    it('should call addAdmin and handle success', () => {
      userService.addAdmin.and.returnValue(of({ message: 'Admin added successfully' }));

      component.addAdmin({ name: 'New Admin', email: 'newadmin@example.com', password: 'newadminpassword' });

      expect(userService.addAdmin).toHaveBeenCalled();
      expect(component.successMessage).toBe('Admin added successfully');
    });

    it('should call addAdmin and handle error', () => {
      userService.addAdmin.and.returnValue(throwError({ error: { message: 'Email already exists' } }));

      component.addAdmin({ name: 'Existing Admin', email: 'admin@example.com', password: 'newadminpassword' });

      expect(userService.addAdmin).toHaveBeenCalled();
      expect(component.errorMessage).toBe('Email already exists');
    });
  });

  describe('removeAdmin', () => {
    it('should call removeAdmin and handle success', () => {
      const adminId = '12345';
      userService.removeAdmin.and.returnValue(of({ message: 'Admin removed successfully' }));

      component.removeAdmin(adminId);

      expect(userService.removeAdmin).toHaveBeenCalledWith(adminId);
      expect(component.successMessage).toBe('Admin removed successfully');
    });

    it('should call removeAdmin and handle error', () => {
      const adminId = 'nonexistentid';
      userService.removeAdmin.and.returnValue(throwError({ error: { message: 'Admin not found' } }));

      component.removeAdmin(adminId);

      expect(userService.removeAdmin).toHaveBeenCalledWith(adminId);
      expect(component.errorMessage).toBe('Admin not found');
    });
  });
});

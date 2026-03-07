import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddRemoveAdminsComponent } from './add-remove-admins.component';
import { AdminService } from '../../services/admin.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('AddRemoveAdminsComponent', () => {
  let component: AddRemoveAdminsComponent;
  let fixture: ComponentFixture<AddRemoveAdminsComponent>;
  let adminService: jasmine.SpyObj<AdminService>;

  beforeEach(async () => {
    const adminServiceSpy = jasmine.createSpyObj('AdminService', ['addAdmin', 'removeAdmin', 'getAdmins']);

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [AddRemoveAdminsComponent],
      providers: [{ provide: AdminService, useValue: adminServiceSpy }]
    }).compileComponents();

    adminService = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
    fixture = TestBed.createComponent(AddRemoveAdminsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    // Clean up state after each test
    component.admins = [];
    component.newAdmin = { name: '', email: '' };
  });

  describe('ngOnInit', () => {
    it('should load existing admins on initialization', () => {
      const mockAdmins = [{ id: 1, name: 'Admin 1', email: 'admin1@example.com' }];
      adminService.getAdmins.and.returnValue(of(mockAdmins));

      component.ngOnInit();

      expect(component.admins).toEqual(mockAdmins);
      expect(adminService.getAdmins).toHaveBeenCalled();
    });

    it('should handle error when loading admins', () => {
      adminService.getAdmins.and.returnValue(throwError('Error loading admins'));

      component.ngOnInit();

      expect(component.admins).toEqual([]); // Assuming default state is empty
      expect(adminService.getAdmins).toHaveBeenCalled();
    });
  });

  describe('addAdmin', () => {
    it('should add a new admin successfully', () => {
      adminService.addAdmin.and.returnValue(of({ message: 'Admin added successfully' }));
      component.newAdmin = { name: 'New Admin', email: 'newadmin@example.com' };

      component.addAdmin();

      expect(adminService.addAdmin).toHaveBeenCalledWith(component.newAdmin);
      expect(component.admins.length).toBe(1); // Assuming the new admin is added to the list
    });

    it('should handle error when adding a new admin', () => {
      adminService.addAdmin.and.returnValue(throwError('Error adding admin'));
      component.newAdmin = { name: 'New Admin', email: 'newadmin@example.com' };

      component.addAdmin();

      expect(adminService.addAdmin).toHaveBeenCalledWith(component.newAdmin);
      expect(component.admins.length).toBe(0); // Assuming no admin is added on error
    });
  });

  describe('removeAdmin', () => {
    it('should remove an admin successfully', () => {
      const mockAdmins = [{ id: 1, name: 'Admin 1', email: 'admin1@example.com' }];
      component.admins = mockAdmins;
      adminService.removeAdmin.and.returnValue(of({ message: 'Admin removed successfully' }));

      component.removeAdmin(1);

      expect(adminService.removeAdmin).toHaveBeenCalledWith(1);
      expect(component.admins.length).toBe(0); // Assuming the admin is removed
    });

    it('should handle error when removing an admin', () => {
      const mockAdmins = [{ id: 1, name: 'Admin 1', email: 'admin1@example.com' }];
      component.admins = mockAdmins;
      adminService.removeAdmin.and.returnValue(throwError('Error removing admin'));

      component.removeAdmin(1);

      expect(adminService.removeAdmin).toHaveBeenCalledWith(1);
      expect(component.admins.length).toBe(1); // Assuming the admin remains on error
    });
  });
});

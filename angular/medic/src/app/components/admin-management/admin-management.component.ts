import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Admin } from '../../models/admin.model';
import { fadeInAnimation } from '../../animations/fade-in.animation';

@Component({
  selector: 'app-admin-management',
  standalone: true,
  templateUrl: './admin-management.component.html',
  styleUrls: ['./admin-management.component.scss'],
  animations: [fadeInAnimation]
})
export class AdminManagementComponent implements OnInit {
  admins: Admin[] = [];
  adminForm: FormGroup;
  isEditing: boolean = false;
  currentAdminId: number | null = null;

  constructor(private adminService: AdminService, private fb: FormBuilder) {
    this.adminForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAdmins();
  }

  loadAdmins(): void {
    this.adminService.getAdmins().subscribe(admins => {
      this.admins = admins;
    });
  }

  editAdmin(admin: Admin): void {
    this.isEditing = true;
    this.currentAdminId = admin.id;
    this.adminForm.patchValue(admin);
  }

  saveAdmin(): void {
    if (this.adminForm.valid) {
      if (this.isEditing && this.currentAdminId) {
        this.adminService.updateAdmin(this.currentAdminId, this.adminForm.value).subscribe(() => {
          this.loadAdmins();
          this.resetForm();
        });
      } else {
        this.adminService.addAdmin(this.adminForm.value).subscribe(() => {
          this.loadAdmins();
          this.resetForm();
        });
      }
    }
  }

  deleteAdmin(adminId: number): void {
    this.adminService.deleteAdmin(adminId).subscribe(() => {
      this.loadAdmins();
    });
  }

  resetForm(): void {
    this.adminForm.reset();
    this.isEditing = false;
    this.currentAdminId = null;
  }
}

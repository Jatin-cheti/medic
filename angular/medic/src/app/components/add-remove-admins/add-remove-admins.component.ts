import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Admin } from '../../models/admin.model';
import { fadeInAnimation } from '../../animations/fade-in.animation';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-remove-admins',
  templateUrl: './add-remove-admins.component.html',
  styleUrls: ['./add-remove-admins.component.scss'],
  animations: [fadeInAnimation],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class AddRemoveAdminsComponent implements OnInit {
  admins: Admin[] = [];
  adminForm: FormGroup;
  showModal: boolean = false;
  selectedAdminId: number | null = null;

  constructor(private fb: FormBuilder, private adminService: AdminService) {
    this.adminForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
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

  addAdmin(): void {
    if (this.adminForm.valid) {
      this.adminService.addAdmin(this.adminForm.value).subscribe(() => {
        this.loadAdmins();
        this.adminForm.reset();
      });
    }
  }

  openModal(adminId: number): void {
    this.selectedAdminId = adminId;
    this.showModal = true;
  }

  removeAdmin(): void {
    if (this.selectedAdminId !== null) {
      this.adminService.removeAdmin(this.selectedAdminId).subscribe(() => {
        this.loadAdmins();
        this.showModal = false;
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedAdminId = null;
  }
}

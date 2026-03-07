import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from './admin.service';
import { User } from './user.model';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  users$!: Observable<User[]>;
  filterForm: FormGroup;

  constructor(private adminService: AdminService, private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      role: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.users$ = this.adminService.getUsers();
  }

  onFilter(): void {
    const role = this.filterForm.value.role;
    this.users$ = this.adminService.getUsersByRole(role);
  }
}

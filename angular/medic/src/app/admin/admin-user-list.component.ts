import { Component, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-admin-user-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AsyncPipe],
  templateUrl: './admin-user-list.component.html',
  styleUrls: ['./admin-user-list.component.scss']
})
export class AdminUserListComponent implements OnInit {
  users$: Observable<User[]> = of([]);
  roles = ['All', 'Patients', 'Doctors', 'Admins'];
  selectedRole: string = 'All';
  filterForm: FormGroup;

  constructor(private userService: UserService, private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      role: [this.selectedRole]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.filterForm.get('role')?.valueChanges.subscribe(value => {
      this.selectedRole = value;
      this.loadUsers();
    });
  }

  loadUsers(): void {
    this.users$ = this.userService.getUsersByRole(this.selectedRole);
  }
}

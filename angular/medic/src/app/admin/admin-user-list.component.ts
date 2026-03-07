import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-user-list',
  standalone: true,
  templateUrl: './admin-user-list.component.html',
  styleUrls: ['./admin-user-list.component.scss']
})
export class AdminUserListComponent implements OnInit {
  users$: Observable<User[]>;
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

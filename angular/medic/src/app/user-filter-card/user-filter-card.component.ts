import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { fadeInAnimation } from '../animations/fade-in.animation';
import { UserCardComponent } from '../user-card/user-card.component';

@Component({
  selector: 'app-user-filter-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserCardComponent],
  templateUrl: './user-filter-card.component.html',
  styleUrls: ['./user-filter-card.component.scss'],
  animations: [fadeInAnimation]
})
export class UserFilterCardComponent implements OnInit {
  filterForm: FormGroup;
  users: User[] = [];
  roles: string[] = ['Patient', 'Doctor', 'Admin', 'Super Admin'];

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.filterForm = this.fb.group({
      role: ['']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsersByRole(this.filterForm.value.role).subscribe(users => {
      this.users = users;
    });
  }

  onFilterChange(): void {
    this.loadUsers();
  }
}

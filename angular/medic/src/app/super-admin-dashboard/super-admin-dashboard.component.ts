import { Component, OnInit } from '@angular/core';
import { SuperAdminService } from './super-admin.service';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  templateUrl: './super-admin-dashboard.component.html',
  styleUrls: ['./super-admin-dashboard.component.scss']
})
export class SuperAdminDashboardComponent implements OnInit {
  users$: Observable<User[]>;
  totalDoctors: number = 0;
  totalPatients: number = 0;
  totalAdmins: number = 0;

  constructor(private superAdminService: SuperAdminService) {}

  ngOnInit(): void {
    this.loadUserStatistics();
    this.users$ = this.superAdminService.getAllUsers();
  }

  loadUserStatistics(): void {
    this.superAdminService.getUserStatistics().subscribe(stats => {
      this.totalDoctors = stats.doctors;
      this.totalPatients = stats.patients;
      this.totalAdmins = stats.admins;
    });
  }
}

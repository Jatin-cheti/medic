import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { AuthService } from '../../core/services/auth.service';

interface Stats {
  doctors: number;
  patients: number;
  pendingDocuments: number;
  admins?: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  stats: Stats = { doctors: 0, patients: 0, pendingDocuments: 0 };
  isLoading = true;
  error = '';

  get isSuperAdmin() {
    return this.auth.getRole() === 'super_admin';
  }

  get basePath() {
    return this.isSuperAdmin ? '/super-admin' : '/admin';
  }

  get userName(): string {
    const user = this.auth.getUserFromToken();
    return user?.email?.split('@')[0] || 'Admin';
  }

  constructor(private adminService: AdminService, private auth: AuthService) {}

  ngOnInit() {
    this.adminService.getStats().subscribe({
      next: (data: Stats) => {
        this.stats = data;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load statistics.';
        this.isLoading = false;
      },
    });
  }
}

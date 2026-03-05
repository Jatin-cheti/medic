import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent implements OnInit {
  role = '';
  userName = '';
  userEmail = '';
  isSidebarOpen = true;

  get isSuperAdmin() {
    return this.role === 'super_admin';
  }

  get basePath() {
    return this.isSuperAdmin ? '/super-admin' : '/admin';
  }

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.role = this.auth.getRole() || '';
    const user = this.auth.getUserFromToken();
    this.userEmail = user?.email || '';
    this.userName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || this.userEmail;
  }

  logout() {
    this.auth.logout();
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  isActive(path: string): boolean {
    return this.router.url === path || this.router.url.startsWith(path + '/');
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  get initials(): string {
    return this.userName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'A';
  }
}

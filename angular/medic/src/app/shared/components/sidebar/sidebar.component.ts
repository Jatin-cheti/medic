import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';
import { DarkModeToggleComponent } from '../dark-mode-toggle/dark-mode-toggle.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, DarkModeToggleComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  // Permanent sidebar - no toggle needed

  userInfo = {
    name: '',
    email: '',
    role: 'Patient',
    avatar: ''
  };

  isDarkMode = false;

  constructor(
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.loadUserInfo();
    
    // Subscribe to theme changes
    this.themeService.isDarkMode$.subscribe((isDark: boolean) => {
      this.isDarkMode = isDark;
    });
    
    // Reload user info after a short delay to catch dashboard data
    setTimeout(() => this.loadUserInfo(), 500);
    setTimeout(() => this.loadUserInfo(), 1500);
  }

  loadUserInfo() {
    // Load from localStorage
    const userEmail = localStorage.getItem('userEmail');
    const firstName = localStorage.getItem('firstName');
    const lastName = localStorage.getItem('lastName');
    const userName = localStorage.getItem('userName');

    if (userEmail) this.userInfo.email = userEmail;
    
    // Try to construct full name from firstName and lastName
    if (firstName && lastName) {
      this.userInfo.name = `${firstName} ${lastName}`.trim();
    } else if (userName) {
      this.userInfo.name = userName;
    } else if (firstName) {
      this.userInfo.name = firstName;
    } else {
      this.userInfo.name = 'Patient';
    }
  }

  getInitials(): string {
    return this.userInfo.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    this.router.navigate(['/patient-login']);
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}

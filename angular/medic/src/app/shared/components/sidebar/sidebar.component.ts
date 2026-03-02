import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();

  userInfo = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Patient',
    avatar: ''
  };

  isDarkMode = false;

  constructor(private router: Router) {
    this.loadUserInfo();
  }

  loadUserInfo() {
    // Load from localStorage or service
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');

    if (userEmail) this.userInfo.email = userEmail;
    if (userName) this.userInfo.name = userName;
  }

  getInitials(): string {
    return this.userInfo.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    localStorage.setItem('darkMode', this.isDarkMode.toString());
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
    this.closeSidebar.emit();
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    this.router.navigate(['/patient-login']);
    this.closeSidebar.emit();
  }

  onOverlayClick() {
    this.closeSidebar.emit();
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';
import { UserService, UserInfo } from '../../../core/services/user.service';
import { DarkModeToggleComponent } from '../dark-mode-toggle/dark-mode-toggle.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, DarkModeToggleComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  // Permanent sidebar - no toggle needed

  userInfo: UserInfo = {
    name: 'Patient',
    email: '',
    role: 'Patient',
    avatar: ''
  };

  isDarkMode = false;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Subscribe to user info changes
    this.userService.userInfo$
      .pipe(takeUntil(this.destroy$))
      .subscribe((userInfo: UserInfo) => {
        this.userInfo = userInfo;
      });

    // Subscribe to theme changes
    this.themeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isDark: boolean) => {
        this.isDarkMode = isDark;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('firstName');
    sessionStorage.removeItem('lastName');
    this.router.navigate(['/patient-login']);
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}

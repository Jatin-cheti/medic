import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('medic');

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    // Debug: Check token state on app initialization
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      const token = sessionStorage.getItem('token');
      const refreshToken = sessionStorage.getItem('refreshToken');
      const role = sessionStorage.getItem('role');
      
      console.log('🔐 App initialized - Auth state:', {
        hasToken: !!token,
        hasRefreshToken: !!refreshToken,
        tokenLength: token?.length || 0,
        role: role,
        isLoggedIn: this.auth.isLoggedIn()
      });

      // If user has valid token and is on auth page, redirect to home
      if (this.auth.isLoggedIn()) {
        const currentUrl = this.router.url;
        const authPages = ['/patient-login', '/doctor-login', '/patient-signup', '/doctor-signup', '/login', '/signup'];
        
        if (authPages.some(page => currentUrl.startsWith(page))) {
          console.log('✅ User is logged in but on auth page, redirecting to /home');
          this.router.navigate(['/home'], { replaceUrl: true });
        }
      }
    }

    // Log navigation events for debugging
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        console.log('📍 Navigated to:', event.urlAfterRedirects);
      });
  }
}

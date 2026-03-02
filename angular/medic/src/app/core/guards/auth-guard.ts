import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    const isLoggedIn = this.auth.isLoggedIn();
    
    if (isLoggedIn) {
      return true;
    }

    // Redirect to patient login (default login page)
    console.log('AuthGuard: User not authenticated, redirecting to patient-login');
    this.router.navigate(['/patient-login']);
    return false;
  }
}

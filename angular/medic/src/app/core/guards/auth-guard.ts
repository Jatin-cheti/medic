import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree | Observable<boolean | UrlTree> {
    const isLoggedIn = this.auth.isLoggedIn();
    
    console.log('🛡️ AuthGuard - checking authentication:', {
      isLoggedIn,
      hasToken: !!this.auth.getToken(),
      currentUrl: this.router.url
    });
    
    if (isLoggedIn) {
      return true;
    }

    // Redirect to patient login (default login page)
    console.warn('❌ AuthGuard: User not authenticated, redirecting to patient-login');
    return this.router.createUrlTree(['/patient-login']);
  }
}

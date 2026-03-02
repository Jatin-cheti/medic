import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AppLoaderComponent } from '../../shared/components/app-loader/app-loader.component';

@Component({
  selector: 'app-google-success',
  standalone: true,
  imports: [CommonModule, AppLoaderComponent],
  template: `
    <div class="google-success-container">
      <app-loader [isLoading]="true"></app-loader>
      <p class="loading-text">Completing Google Sign-In...</p>
    </div>
  `,
  styles: [`
    .google-success-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .loading-text {
      color: white;
      font-size: 1.1rem;
      margin-top: 1rem;
      font-weight: 500;
    }
  `]
})
export class GoogleSuccessComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const refreshToken = params['refreshToken'];
      const role = params['role'];
      
      if (token && refreshToken) {
        // Store tokens in localStorage
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', refreshToken);
          if (role) {
            localStorage.setItem('role', role);
          }
        }
        
        // Redirect to home/dashboard
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 500);
      } else {
        // If tokens are missing, redirect to login with error
        this.router.navigate(['/auth/patient-login'], {
          queryParams: { error: 'auth_failed' }
        });
      }
    });
  }
}

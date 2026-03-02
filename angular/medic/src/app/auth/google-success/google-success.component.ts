import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AppLoaderComponent } from '../../shared/components/app-loader/app-loader.component';

@Component({
  selector: 'app-google-success',
  standalone: true,
  imports: [CommonModule, AppLoaderComponent],
  template: `
    <div class="google-success-container">
      <app-loader [show]="true"></app-loader>
      <p class="loading-text">Completing Google Sign-In...</p>
      <p *ngIf="errorMessage" class="error-text">{{errorMessage}}</p>
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

    .error-text {
      color: #ff6b6b;
      background: white;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1rem;
      font-weight: 500;
    }
  `]
})
export class GoogleSuccessComponent implements OnInit {
  errorMessage = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('GoogleSuccessComponent initialized');
    
    this.route.queryParams.subscribe(params => {
      console.log('Query params:', params);
      const token = params['token'];
      const refreshToken = params['refreshToken'];
      const role = params['role'];

      if (token && refreshToken) {
        console.log('Tokens found, storing in sessionStorage...');
        
        try {
          // Store tokens in sessionStorage
          if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('refreshToken', refreshToken);
            if (role) {
              sessionStorage.setItem('role', role);
            }
            console.log('Tokens stored successfully');
            console.log('Token length:', token.length);
            console.log('Role:', role);
          }

          this.cdr.markForCheck();
          
          // Navigate to home after successful token storage
          setTimeout(() => {
            console.log('Navigating to /home');
            this.router.navigate(['/home'], { replaceUrl: true }).then(success => {
              console.log('Navigation success:', success);
            }).catch(err => {
              console.error('Navigation error:', err);
              this.errorMessage = 'Navigation failed. Please try again.';
              this.cdr.markForCheck();
            });
          }, 500);
        } catch (error) {
          console.error('Error storing tokens:', error);
          this.errorMessage = 'Failed to store authentication tokens.';
          this.cdr.markForCheck();
        }
      } else {
        console.error('No tokens found in query params');
        this.errorMessage = 'Authentication tokens not received from server.';
        this.cdr.markForCheck();
        
        // Redirect to login with error after a delay
        setTimeout(() => {
          this.router.navigate(['/patient-login'], {
            queryParams: { error: 'auth_failed' },
            replaceUrl: true
          });
        }, 2000);
      }
    });
  }
}

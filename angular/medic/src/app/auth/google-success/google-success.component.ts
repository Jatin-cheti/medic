import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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
    private route: ActivatedRoute,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const refreshToken = params['refreshToken'];
      const role = params['role'] || 'patient';

      if (token && refreshToken) {
        // Store tokens first, then do a hard redirect so the app boots fresh
        // with tokens already in localStorage — avoids Angular Router guard
        // race conditions after an external OAuth page redirect.
        this.auth.handleOAuthCallback(token, refreshToken, role);
        window.location.replace('/home');
      } else {
        this.errorMessage = 'Authentication tokens not received.';
        setTimeout(() => {
          window.location.replace('/patient-login?error=auth_failed');
        }, 2000);
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AppLoaderComponent } from '../../shared/components/app-loader/app-loader.component';
import { AppErrorComponent } from '../../shared/components/app-error/app-error.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-patient-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AppLoaderComponent, AppErrorComponent],
  templateUrl: './patient-login.component.html',
  styleUrls: ['./patient-login.component.scss']
})
export class PatientLoginComponent implements OnInit {
  loginForm: any;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Check for OAuth callback from URL
    this.route.queryParams.subscribe(params => {
      if (params['googleId'] && params['email']) {
        this.handleGoogleCallback(params);
      }
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    const value = this.loginForm.value;
    const payload: any = { password: value.password };
    if (String(value.identifier).includes('@')) {
      payload.email = String(value.identifier).trim().toLowerCase();
    } else {
      payload.phone = String(value.identifier).trim();
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.auth.loginPatient(payload).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.errorMessage = this.auth.getErrorMessage(err);
      }
    });
  }

  loginWithGoogle() {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Prompt user for email to test Google login
    const email = prompt('Enter email for Google login test:');
    if (!email) {
      this.isLoading = false;
      return;
    }

    this.auth.googleTestLogin(email, 'Test', 'User').pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.errorMessage = this.auth.getErrorMessage(err);
      }
    });
  }

  handleGoogleCallback(params: any) {
    const { googleId, email, firstName, lastName } = params;
    if (!googleId || !email) {
      this.errorMessage = 'Google authentication failed. Missing required information.';
      return;
    }

    this.isLoading = true;
    this.auth.googleLogin(googleId, email, firstName || 'User', lastName || '').pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.errorMessage = this.auth.getErrorMessage(err);
      }
    });
  }

  clearError() {
    this.errorMessage = '';
  }
}

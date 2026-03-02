import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Check for OAuth errors from URL
    this.route.queryParams.subscribe(params => {
      if (params['error']) {
        const errorMap: Record<string, string> = {
          'auth_failed': 'Google authentication failed. Please try again.',
          'invalid_user_data': 'Invalid user data from Google.',
          'user_creation_failed': 'Failed to create user account.',
          'server_error': 'Server error occurred. Please try again later.'
        };
        this.errorMessage = errorMap[params['error']] || 'Authentication failed. Please try again.';
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
    this.cdr.markForCheck();
    
    console.log('🔐 Starting login...');
    
    this.auth.loginPatient(payload).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (response) => {
        console.log('✅ Login successful:', { hasToken: !!response });
        console.log('🏠 Navigating to /home...');
        
        // Navigate with replaceUrl to prevent back button issues
        this.router.navigate(['/home'], { replaceUrl: true }).then(success => {
          console.log('✅ Navigation result:', success);
          if (!success) {
            console.error('❌ Navigation failed');
          }
        }).catch(navError => {
          console.error('❌ Navigation error:', navError);
        });
      },
      error: (err) => {
        console.error('❌ Login error:', err);
        this.errorMessage = this.auth.getErrorMessage(err);
        this.cdr.markForCheck();
      }
    });
  }

  loginWithGoogle() {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${this.auth.getBackendUrl()}/api/auth/google`;
  }

  clearError() {
    this.errorMessage = '';
  }
}

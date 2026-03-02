import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppErrorComponent } from '../../shared/components/app-error/app-error.component';
import { AppLoaderComponent } from '../../shared/components/app-loader/app-loader.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    AppErrorComponent,
    AppLoaderComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: any;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    const value = this.loginForm.value;
    const payload: any = {
      password: value.password,
    };

    if (String(value.identifier).includes('@')) {
      payload.email = String(value.identifier).trim().toLowerCase();
    } else {
      payload.phone = String(value.identifier).trim();
    }

    this.errorMessage = '';
    this.isLoading = true;
    this.auth.loginDoctor(payload)
      .subscribe(() => {
        this.isLoading = false;
        this.router.navigate(['/home']);
      }, (err) => {
        this.isLoading = false;
        this.errorMessage = this.auth.getErrorMessage(err);
      });
  }

  clearError() {
    this.errorMessage = '';
  }
}

import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: any;
  errorMessage = '';

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
    this.auth.loginDoctor(payload)
      .subscribe(() => {
        this.router.navigate(['/dashboard']);
      }, (err) => {
        this.errorMessage = err?.error?.error || 'Unable to login. Please try again.';
      });
  }
}

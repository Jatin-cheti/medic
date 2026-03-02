import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  signupForm: any;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.signupForm.invalid) return;

    this.errorMessage = '';
    this.isLoading = true;
    this.auth.signup(this.signupForm.value)
      .subscribe(() => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      }, (err) => {
        this.isLoading = false;
        this.errorMessage = this.auth.getErrorMessage(err);
      });
  }

  clearError() {
    this.errorMessage = '';
  }
}

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { fadeInAnimation } from '../animations/fade-in.animation';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss'],
  animations: [fadeInAnimation]
})
export class AuthenticationComponent {
  authForm: FormGroup;
  errorMessage: string | null = null;
  loading: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.authForm = this.fb.group({
      role: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.authForm.valid) {
      this.loading = true;
      this.authService.login(this.authForm.value).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.errorMessage = err.error.message;
          this.loading = false;
        }
      });
    }
  }
}

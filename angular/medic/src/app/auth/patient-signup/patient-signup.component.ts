import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AppLoaderComponent } from '../../shared/components/app-loader/app-loader.component';
import { AppErrorComponent } from '../../shared/components/app-error/app-error.component';

@Component({
  selector: 'app-patient-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AppLoaderComponent, AppErrorComponent],
  templateUrl: './patient-signup.component.html',
  styleUrls: ['./patient-signup.component.scss']
})
export class PatientSignupComponent implements OnInit {
  signupForm: any;
  errorMessage = '';
  isLoading = false;
  genders = ['Male', 'Female', 'Other', 'Prefer not to say'];
  languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
  ];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: [''],
      email: [''],
      phone: [''],
      gender: [''],
      preferredLanguage: ['en'],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    // Load languages from REST Countries API
    this.loadLanguages();
  }

  loadLanguages() {
    // Using a simple hardcoded list for now, but can be extended with API calls if needed
  }

  onSubmit() {
    if (this.signupForm.invalid) return;

    const value = this.signupForm.value;
    if (!value.email && !value.phone) {
      this.errorMessage = 'Please provide email or phone.';
      return;
    }

    if (value.password !== value.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    const payload = {
      firstName: value.firstName,
      lastName: value.lastName,
      email: value.email || null,
      phone: value.phone || null,
      gender: value.gender || null,
      preferredLanguage: value.preferredLanguage || 'en',
      password: value.password,
    };

    this.errorMessage = '';
    this.isLoading = true;
    this.auth.signupPatient(payload).subscribe(() => {
      this.isLoading = false;
      this.router.navigate(['/patient-login']);
    }, (err) => {
      this.isLoading = false;
      this.errorMessage = this.auth.getErrorMessage(err);
    });
  }

  clearError() {
    this.errorMessage = '';
  }
}

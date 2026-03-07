import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DoctorOnboardingService } from '../../services/doctor-onboarding.service';

@Component({
  selector: 'app-doctor-onboarding',
  standalone: true,
  templateUrl: './doctor-onboarding.component.html',
  styleUrls: ['./doctor-onboarding.component.scss']
})
export class DoctorOnboardingComponent {
  onboardingForm: FormGroup;
  step: number = 1;
  isSubmitting: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private onboardingService: DoctorOnboardingService
  ) {
    this.onboardingForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      specialization: ['', [Validators.required]],
      degree: [null, [Validators.required]],
      experienceCertificate: [null, [Validators.required]]
    });
  }

  nextStep(): void {
    if (this.step < 3) {
      this.step++;
    }
  }

  previousStep(): void {
    if (this.step > 1) {
      this.step--;
    }
  }

  onFileChange(event: any, controlName: string): void {
    const file = event.target.files[0];
    if (file) {
      this.onboardingForm.get(controlName)?.setValue(file);
    }
  }

  submit(): void {
    if (this.onboardingForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    const formData = new FormData();
    Object.keys(this.onboardingForm.controls).forEach(key => {
      formData.append(key, this.onboardingForm.get(key)?.value);
    });

    this.onboardingService.submitOnboarding(formData).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.isSubmitting = false;
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (error) => {
        this.errorMessage = error.error.message || 'An error occurred. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}

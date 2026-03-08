import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DoctorOnboardingService } from './doctor-onboarding.service';
import { fadeInAnimation } from '../animations/fade-in.animation';

@Component({
  selector: 'app-doctor-onboarding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './doctor-onboarding.component.html',
  styleUrls: ['./doctor-onboarding.component.scss'],
  animations: [fadeInAnimation]
})
export class DoctorOnboardingComponent implements OnInit {
  onboardingForm: FormGroup;
  uploadStatus: string = 'Pending';
  notification: string = '';

  constructor(private fb: FormBuilder, private onboardingService: DoctorOnboardingService) {
    this.onboardingForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      experienceCertificate: [null, Validators.required],
      degree: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.checkUploadStatus();
  }

  onFileChange(event: any, field: string) {
    const file = event.target.files[0];
    if (file) {
      this.onboardingForm.patchValue({ [field]: file });
    }
  }

  submit() {
    if (this.onboardingForm.valid) {
      this.onboardingService.uploadDocuments(this.onboardingForm.value).subscribe({
        next: (response) => {
          this.notification = 'Documents uploaded successfully!';
          this.uploadStatus = response.status;
        },
        error: (error) => {
          this.notification = 'Error uploading documents.';
        }
      });
    }
  }

  checkUploadStatus() {
    this.onboardingService.getUploadStatus().subscribe(status => {
      this.uploadStatus = status;
    });
  }
}

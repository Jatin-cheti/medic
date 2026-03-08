import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PrescriptionService } from './prescription.service';
import { fadeInAnimation } from '../animations/fade-in.animation';

@Component({
  selector: 'app-prescription-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './prescription-upload.component.html',
  styleUrls: ['./prescription-upload.component.scss'],
  animations: [fadeInAnimation]
})
export class PrescriptionUploadComponent implements OnInit {
  prescriptionForm: FormGroup;
  selectedImage: File | null = null;

  getObjectUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  constructor(private fb: FormBuilder, private prescriptionService: PrescriptionService) {
    this.prescriptionForm = this.fb.group({
      prescriptionText: ['', Validators.required],
      prescriptionImage: [null]
    });
  }

  ngOnInit(): void {}

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedImage = input.files[0];
    }
  }

  onSubmit(): void {
    if (this.prescriptionForm.valid) {
      const formData = new FormData();
      formData.append('prescriptionText', this.prescriptionForm.value.prescriptionText);
      if (this.selectedImage) {
        formData.append('prescriptionImage', this.selectedImage);
      }

      this.prescriptionService.uploadPrescription(formData).subscribe({
        next: () => {
          alert('Prescription uploaded successfully!');
          this.prescriptionForm.reset();
          this.selectedImage = null;
        },
        error: (err) => {
          console.error(err);
          alert('Failed to upload prescription.');
        }
      });
    }
  }
}

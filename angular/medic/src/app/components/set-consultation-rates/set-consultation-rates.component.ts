import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ConsultationRatesService } from '../../services/consultation-rates.service';
import { fadeInAnimation } from '../../animations/fade-in.animation';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-set-consultation-rates',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './set-consultation-rates.component.html',
  styleUrls: ['./set-consultation-rates.component.scss'],
  animations: [fadeInAnimation]
})
export class SetConsultationRatesComponent implements OnInit {
  consultationRateForm!: FormGroup;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private ratesService: ConsultationRatesService) {}

  ngOnInit(): void {
    this.consultationRateForm = this.fb.group({
      rate: ['', [Validators.required, Validators.min(0)]],
      consultationType: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.consultationRateForm.valid) {
      this.ratesService.setConsultationRate(this.consultationRateForm.value).subscribe({
        next: () => {
          this.successMessage = 'Consultation rate set successfully!';
          this.errorMessage = null;
          this.consultationRateForm.reset();
        },
        error: () => {
          this.errorMessage = 'Failed to set consultation rate. Please try again.';
          this.successMessage = null;
        }
      });
    }
  }
}

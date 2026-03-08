import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ConsultationRateService } from '../../services/consultation-rate.service';
import { fadeInAnimation, slideUpAnimation } from '../../animations';

@Component({
  selector: 'app-set-consultation-rate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './set-consultation-rate.component.html',
  styleUrls: ['./set-consultation-rate.component.scss'],
  animations: [fadeInAnimation, slideUpAnimation]
})
export class SetConsultationRateComponent implements OnInit {
  consultationRateForm: FormGroup;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private consultationRateService: ConsultationRateService
  ) {
    this.consultationRateForm = this.fb.group({
      rate: ['', [Validators.required, Validators.min(0)]],
      type: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.consultationRateForm.valid) {
      this.consultationRateService.setConsultationRate(this.consultationRateForm.value)
        .subscribe({
          next: () => {
            this.successMessage = "Consultation rate set successfully!";
            this.consultationRateForm.reset();
          },
          error: () => {
            this.successMessage = "Failed to set consultation rate.";
          }
        });
    }
  }
}

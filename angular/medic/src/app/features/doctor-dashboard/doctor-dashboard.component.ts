import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SymptomCheckerService } from '../../services/symptom-checker.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.scss']
})
export class DoctorDashboardComponent implements OnInit {
  symptomForm: FormGroup;
  diagnosisResult: string | null = null;
  recommendations: string[] = [];
  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private symptomCheckerService: SymptomCheckerService) {
    this.symptomForm = this.fb.group({
      symptoms: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.symptomForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.diagnosisResult = null;
    this.recommendations = [];

    const symptoms = this.symptomForm.value.symptoms.split(',').map((s: string) => s.trim());
    this.symptomCheckerService.checkSymptoms(symptoms).subscribe({
      next: (response) => {
        this.diagnosisResult = response.diagnosis;
        this.recommendations = response.recommendations;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching diagnosis:', error);
        this.isLoading = false;
      }
    });
  }
}

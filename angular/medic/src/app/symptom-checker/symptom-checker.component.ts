import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SymptomCheckerService } from './symptom-checker.service';
import { fadeInAnimation } from '../animations/fade-in.animation';

@Component({
  selector: 'app-symptom-checker',
  standalone: true,
  templateUrl: './symptom-checker.component.html',
  styleUrls: ['./symptom-checker.component.scss'],
  animations: [fadeInAnimation]
})
export class SymptomCheckerComponent implements OnInit {
  symptomForm: FormGroup;
  loading = false;
  results: any;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private symptomCheckerService: SymptomCheckerService) {
    this.symptomForm = this.fb.group({
      symptoms: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.symptomForm.valid) {
      this.loading = true;
      this.errorMessage = null;

      this.symptomCheckerService.checkSymptoms(this.symptomForm.value.symptoms).subscribe({
        next: (data) => {
          this.results = data;
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = 'Error fetching results. Please try again.';
          this.loading = false;
        }
      });
    }
  }
}

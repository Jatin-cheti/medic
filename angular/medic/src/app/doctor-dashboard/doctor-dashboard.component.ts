import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DoctorService } from '../services/doctor.service';
import { fadeInAnimation, slideUpAnimation } from '../animations';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.scss'],
  animations: [fadeInAnimation, slideUpAnimation]
})
export class DoctorDashboardComponent implements OnInit {
  appointments: any[] = [];
  symptomCheckerForm: FormGroup;

  constructor(private fb: FormBuilder, private doctorService: DoctorService) {
    this.symptomCheckerForm = this.fb.group({
      symptoms: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.doctorService.getAppointments().subscribe((data) => {
      this.appointments = data;
    });
  }

  submitSymptomChecker(): void {
    if (this.symptomCheckerForm.valid) {
      // Handle symptom checker submission
      console.log(this.symptomCheckerForm.value);
    }
  }
}

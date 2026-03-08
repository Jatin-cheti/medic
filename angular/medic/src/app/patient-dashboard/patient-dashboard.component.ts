import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PatientService } from '../services/patient.service';
import { fadeInAnimation } from '../animations/fade-in.animation';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, RouterModule],
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.scss'],
  animations: [fadeInAnimation]
})
export class PatientDashboardComponent implements OnInit {
  appointments: any[] = [];
  pastAppointments: any[] = [];
  prescriptionForm: FormGroup;

  constructor(private patientService: PatientService, private fb: FormBuilder) {
    this.prescriptionForm = this.fb.group({
      prescription: ['', Validators.required],
      file: [null]
    });
  }

  ngOnInit(): void {
    this.loadAppointments();
    this.loadPastAppointments();
  }

  loadAppointments() {
    this.patientService.getUpcomingAppointments().subscribe(data => {
      this.appointments = data;
    });
  }

  loadPastAppointments() {
    this.patientService.getPastAppointments().subscribe(data => {
      this.pastAppointments = data;
    });
  }

  onSubmit() {
    if (this.prescriptionForm.valid) {
      // Handle prescription upload logic
    }
  }
}

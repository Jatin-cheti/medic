import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DoctorService } from '../services/doctor.service';
import { Doctor } from '../models/doctor.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  templateUrl: './doctor-list.component.html',
  styleUrls: ['./doctor-list.component.scss'],
})
export class DoctorListComponent implements OnInit {
  doctors: Doctor[] = [];
  selectedDoctor: Doctor | null = null;
  appointmentForm: FormGroup;

  constructor(private doctorService: DoctorService, private fb: FormBuilder, private modalService: NgbModal) {
    this.appointmentForm = this.fb.group({
      consultationType: ['', Validators.required],
      appointmentDate: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.doctorService.getDoctors().subscribe((data) => {
      this.doctors = data;
    });
  }

  openModal(content: any, doctor: Doctor): void {
    this.selectedDoctor = doctor;
    this.modalService.open(content);
  }

  bookAppointment(): void {
    if (this.appointmentForm.valid && this.selectedDoctor) {
      // Logic to book the appointment
      console.log('Booking appointment for:', this.selectedDoctor.name, this.appointmentForm.value);
      this.modalService.dismissAll();
    }
  }
}

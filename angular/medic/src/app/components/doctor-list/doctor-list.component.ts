import { Component, OnInit } from '@angular/core';
import { DoctorService } from '../../services/doctor.service';
import { Doctor } from '../../models/doctor.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppointmentModalComponent } from '../appointment-modal/appointment-modal.component';
import { fadeInAnimation } from '../../animations/fade-in.animation';

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  templateUrl: './doctor-list.component.html',
  styleUrls: ['./doctor-list.component.scss'],
  animations: [fadeInAnimation]
})
export class DoctorListComponent implements OnInit {
  doctors: Doctor[] = [];
  loading: boolean = true;

  constructor(private doctorService: DoctorService, private modalService: NgbModal) {}

  ngOnInit(): void {
    this.fetchDoctors();
  }

  fetchDoctors(): void {
    this.doctorService.getDoctors().subscribe({
      next: (data) => {
        this.doctors = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching doctors', err);
        this.loading = false;
      }
    });
  }

  openAppointmentModal(doctor: Doctor): void {
    const modalRef = this.modalService.open(AppointmentModalComponent);
    modalRef.componentInstance.doctor = doctor;
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PastAppointmentsService } from './past-appointments.service';
import { Appointment } from './appointment.model';
import { fadeInAnimation } from '../animations/fade-in.animation';

@Component({
  selector: 'app-past-appointments',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './past-appointments.component.html',
  styleUrls: ['./past-appointments.component.scss'],
  animations: [fadeInAnimation]
})
export class PastAppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  loading: boolean = true;

  constructor(private pastAppointmentsService: PastAppointmentsService) {}

  ngOnInit(): void {
    this.loadPastAppointments();
  }

  loadPastAppointments(): void {
    this.pastAppointmentsService.getPastAppointments().subscribe({
      next: (data) => {
        this.appointments = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        // Handle error appropriately
      }
    });
  }

  savePrescription(appointmentId: string): void {
    // Logic to save prescription
  }
}

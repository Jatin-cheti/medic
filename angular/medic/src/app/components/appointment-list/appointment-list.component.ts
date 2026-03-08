import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../models/appointment.model';
import { fadeInAnimation } from '../../animations/fade-in.animation';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss'],
  animations: [fadeInAnimation]
})
export class AppointmentListComponent implements OnInit {
  appointments: Appointment[] = [];
  loading: boolean = true;

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.fetchAppointments();
  }

  fetchAppointments(): void {
    this.appointmentService.getAppointments().subscribe({
      next: (data: Appointment[]) => {
        this.appointments = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        // Handle error appropriately
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { AppointmentService } from './appointment.service';
import { Appointment } from './appointment.model';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AppointmentCardComponent } from './appointment-card.component';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, AppointmentCardComponent],
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss']
})
export class AppointmentListComponent implements OnInit {
  appointments$!: Observable<Appointment[]>;

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.appointments$ = this.appointmentService.getAppointments();
  }
}

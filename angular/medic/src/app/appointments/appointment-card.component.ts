import { Component, Input } from '@angular/core';
import { Appointment } from './appointment.model';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-appointment-card',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule],
  templateUrl: './appointment-card.component.html',
  styleUrls: ['./appointment-card.component.scss']
})
export class AppointmentCardComponent {
  @Input() appointment!: Appointment;
}

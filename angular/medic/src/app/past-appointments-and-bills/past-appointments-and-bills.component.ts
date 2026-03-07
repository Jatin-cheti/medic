import { Component, OnInit } from '@angular/core';
import { PastAppointmentsService } from './past-appointments.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Appointment } from './appointment.model';
import { fadeInAnimation } from '../animations/fade-in.animation';

@Component({
  selector: 'app-past-appointments-and-bills',
  standalone: true,
  templateUrl: './past-appointments-and-bills.component.html',
  styleUrls: ['./past-appointments-and-bills.component.scss'],
  animations: [fadeInAnimation]
})
export class PastAppointmentsAndBillsComponent implements OnInit {
  appointments: Appointment[] = [];
  searchForm: FormGroup;

  constructor(private pastAppointmentsService: PastAppointmentsService, private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      searchTerm: ['']
    });
  }

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.pastAppointmentsService.getPastAppointments().subscribe((data: Appointment[]) => {
      this.appointments = data;
    });
  }

  filterAppointments(): void {
    const searchTerm = this.searchForm.get('searchTerm')?.value.toLowerCase();
    this.appointments = this.appointments.filter(appointment => 
      appointment.doctorName.toLowerCase().includes(searchTerm) || 
      appointment.date.includes(searchTerm)
    );
  }
}

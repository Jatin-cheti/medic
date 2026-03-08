import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-appointment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointment-modal.component.html',
  styleUrls: ['./appointment-modal.component.scss']
})
export class AppointmentModalComponent {
  @Input() doctor: any;
  appointmentForm: FormGroup;

  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder) {
    this.appointmentForm = this.fb.group({
      appointmentType: ['', Validators.required],
      appointmentDate: ['', Validators.required]
    });
  }

  bookAppointment(): void {
    if (this.appointmentForm.valid) {
      // Logic to book appointment
      console.log('Appointment booked:', this.appointmentForm.value);
      this.activeModal.close();
    }
  }
}

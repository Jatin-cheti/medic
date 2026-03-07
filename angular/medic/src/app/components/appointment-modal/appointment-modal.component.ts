import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-appointment-modal',
  standalone: true,
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

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';
import { fadeInAnimation } from '../../animations/fade-in.animation';

@Component({
  selector: 'app-appointment-reminder-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointment-reminder-card.component.html',
  styleUrls: ['./appointment-reminder-card.component.scss'],
  animations: [fadeInAnimation]
})
export class AppointmentReminderCardComponent {
  @Input() appointment: any;
  reminderForm: FormGroup;

  constructor(private fb: FormBuilder, private appointmentService: AppointmentService) {
    this.reminderForm = this.fb.group({
      message: ['', [Validators.required, Validators.maxLength(250)]]
    });
  }

  sendReminder() {
    if (this.reminderForm.valid) {
      this.appointmentService.sendReminder(this.appointment.id, this.reminderForm.value.message).subscribe({
        next: () => {
          alert('Reminder sent successfully!');
          this.reminderForm.reset();
        },
        error: (err) => {
          console.error(err);
          alert('Failed to send reminder.');
        }
      });
    }
  }
}

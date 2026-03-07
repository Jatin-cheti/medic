import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';
import { fadeInAnimation } from '../../animations/fade-in.animation';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-appointment-reminder',
  templateUrl: './appointment-reminder.component.html',
  styleUrls: ['./appointment-reminder.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  animations: [fadeInAnimation]
})
export class AppointmentReminderComponent implements OnInit {
  reminderForm: FormGroup;

  constructor(private fb: FormBuilder, private appointmentService: AppointmentService) {
    this.reminderForm = this.fb.group({
      appointmentId: ['', Validators.required],
      reminderMethod: ['', Validators.required],
      reminderFrequency: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.reminderForm.valid) {
      this.appointmentService.sendReminder(this.reminderForm.value).subscribe({
        next: (response) => {
          console.log('Reminder sent successfully', response);
          // Handle success (e.g., show a success message)
        },
        error: (error) => {
          console.error('Error sending reminder', error);
          // Handle error (e.g., show an error message)
        }
      });
    }
  }
}

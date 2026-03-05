import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../services/admin.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-create-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-admin.component.html',
  styleUrls: ['./create-admin.component.scss'],
})
export class CreateAdminComponent {
  form: ReturnType<FormBuilder['group']>;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private adminService: AdminService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      firstName: ['', Validators.required],
      lastName: [''],
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const { email, password, firstName, lastName } = this.form.value;

    this.adminService.createAdmin({
      email: email!,
      password: password!,
      firstName: firstName!,
      lastName: lastName || '',
    }).pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.successMessage = `Admin account for ${email} created successfully.`;
          this.form.reset();
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to create admin.';
        },
      });
  }
}

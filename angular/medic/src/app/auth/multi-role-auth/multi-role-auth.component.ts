import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { fadeInAnimation } from '../animations/fade-in.animation';

@Component({
  selector: 'app-multi-role-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './multi-role-auth.component.html',
  styleUrls: ['./multi-role-auth.component.scss'],
  animations: [fadeInAnimation]
})
export class MultiRoleAuthComponent {
  authForm: FormGroup;
  roles = ['Patient', 'Doctor', 'Admin', 'Super Admin'];
  selectedRole: string = this.roles[0];

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.authForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onRoleChange(role: string) {
    this.selectedRole = role;
  }

  onSubmit() {
    if (this.authForm.valid) {
      this.authService.login(this.selectedRole.toLowerCase(), this.authForm.value).subscribe({
        next: () => this.router.navigate(['dashboard']),
        error: (err) => console.error(err)
      });
    }
  }
}

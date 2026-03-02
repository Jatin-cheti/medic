import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-doctor-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './doctor-signup.component.html',
  styleUrls: ['./doctor-signup.component.scss']
})
export class DoctorSignupComponent implements OnInit {
  signupForm: any;
  errorMessage = '';
  genders = ['Male', 'Female', 'Other', 'Prefer not to say'];
  languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
  ];
  degreeFileName = '';
  experienceFileName = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: [''],
      email: [''],
      phone: [''],
      registrationNumber: ['', Validators.required],
      yearsOfExperience: [0, Validators.required],
      consultationFee: [0, Validators.required],
      gender: [''],
      preferredLanguage: ['en'],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
      degreeFile: [null, Validators.required],
      experienceFile: [null, Validators.required],
    });
  }

  ngOnInit() {
    // Load languages from REST Countries API
    this.loadLanguages();
  }

  loadLanguages() {
    // Using a simple hardcoded list for now, but can be extended with API calls if needed
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  onDegreeFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length ? input.files[0] : null;
    if (file) {
      this.degreeFileName = file.name;
    }
    this.signupForm.patchValue({ degreeFile: file });
    this.signupForm.get('degreeFile')?.updateValueAndValidity();
  }

  onExperienceFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length ? input.files[0] : null;
    if (file) {
      this.experienceFileName = file.name;
    }
    this.signupForm.patchValue({ experienceFile: file });
    this.signupForm.get('experienceFile')?.updateValueAndValidity();
  }

  async onSubmit() {
    if (this.signupForm.invalid) return;

    const value = this.signupForm.value;

    if (!value.email && !value.phone) {
      this.errorMessage = 'Please provide email or phone.';
      return;
    }

    if (value.password !== value.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (!value.degreeFile || !value.experienceFile) {
      this.errorMessage = 'Degree and experience certificates are required.';
      return;
    }

    try {
      const degreeFileUrl = await this.fileToDataUrl(value.degreeFile as File);
      const experienceFileUrl = await this.fileToDataUrl(value.experienceFile as File);

      const payload = {
        firstName: value.firstName,
        lastName: value.lastName,
        email: value.email || null,
        phone: value.phone || null,
        registrationNumber: value.registrationNumber,
        yearsOfExperience: Number(value.yearsOfExperience || 0),
        consultationFee: Number(value.consultationFee || 0),
        gender: value.gender || null,
        preferredLanguage: value.preferredLanguage || 'en',
        password: value.password,
        degreeFileName: (value.degreeFile as File).name,
        degreeFileUrl,
        experienceFileName: (value.experienceFile as File).name,
        experienceFileUrl,
      };

      this.errorMessage = '';
      this.auth.signupDoctor(payload).subscribe(() => {
        this.router.navigate(['/doctor-login']);
      }, (err) => {
        this.errorMessage = err?.error?.error || 'Unable to signup. Please try again.';
      });
    } catch {
      this.errorMessage = 'Unable to read selected files.';
    }
  }
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AppLoaderComponent } from '../../shared/components/app-loader/app-loader.component';
import { UserService } from '../../core/services/user.service';
import { finalize } from 'rxjs';

interface UserProfile {
  id: number;
  uuid: string;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  preferredLanguage: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppLoaderComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  profile: UserProfile | null = null;
  isLoading = false;
  isEditing = false;
  errorMessage = '';
  successMessage = '';

  // File upload
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isUploadingAvatar = false;

  private apiUrl = `${environment.apiUrl}/api/profile`;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private userService: UserService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: [{ value: '', disabled: true }],
      phone: ['', [Validators.pattern(/^[+]?[\d\s\-()]{10,}$/)]],
      dateOfBirth: [''],
      gender: [''],
      preferredLanguage: ['en'],
    });
  }

  ngOnInit() {
    console.log('ProfileComponent ngOnInit - Token:', sessionStorage.getItem('token') ? 'Present' : 'Missing');
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    const token = sessionStorage.getItem('token');
    console.log('loadProfile - Making request to:', this.apiUrl);
    console.log('loadProfile - Token present:', !!token);

    this.http.get<UserProfile>(this.apiUrl)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (data) => {
          console.log('Profile loaded successfully:', data);
          this.profile = data;
          this.previewUrl = data.avatarUrl || null;

          this.userService.setUserInfo(
            data.firstName,
            data.lastName,
            data.email,
            data.avatarUrl || ''
          );
          this.profileForm.patchValue({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone || '',
            dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
            gender: data.gender || '',
            preferredLanguage: data.preferredLanguage,
          });
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Profile load error:', err);
          this.errorMessage = 'Failed to load profile. Please try again.';
          console.error('Profile load error:', err);
        }
      });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.isEditing) {
      this.selectedFile = null;
      this.loadProfile();
    }
    this.cdr.markForCheck();
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Invalid file type. Please upload JPEG, PNG, or WebP image.';
      this.cdr.markForCheck();
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.errorMessage = 'File size exceeds 5MB limit.';
      this.cdr.markForCheck();
      return;
    }

    this.selectedFile = file;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
    this.errorMessage = '';
    this.cdr.markForCheck();
  }

  async uploadAvatar() {
    if (!this.selectedFile) return;

    this.isUploadingAvatar = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    try {
      // Get presigned URL
      const uploadResponse = await this.http.post<{ uploadUrl: string }>(
        `${this.apiUrl}/avatar-upload-url`,
        {
          fileName: this.selectedFile.name,
          fileType: this.selectedFile.type
        }
      ).toPromise();

      if (!uploadResponse?.uploadUrl) {
        throw new Error('Failed to get upload URL');
      }

      // Upload file to S3
      await this.uploadFileToS3(uploadResponse.uploadUrl, this.selectedFile);

      // Update avatar URL in backend
      const s3Url = this.getS3UrlFromPresigned(uploadResponse.uploadUrl);
      await this.http.put(
        `${this.apiUrl}/avatar`,
        { avatarUrl: s3Url }
      ).toPromise();

      this.successMessage = 'Profile picture updated successfully!';
      this.selectedFile = null;
      this.loadProfile();
    } catch (err) {
      this.errorMessage = 'Failed to upload profile picture. Please try again.';
      console.error('Upload error:', err);
    } finally {
      this.isUploadingAvatar = false;
      this.cdr.markForCheck();
    }
  }

  private uploadFileToS3(presignedUrl: string, file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          console.log(`Upload progress: ${percentComplete}%`);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('PUT', presignedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  }

  private getS3UrlFromPresigned(presignedUrl: string): string {
    // Extract the S3 URL without query parameters
    return presignedUrl.split('?')[0];
  }

  onSubmit() {
    if (this.profileForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      this.cdr.markForCheck();
      return;
    }

    const formValue = this.profileForm.getRawValue();

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    const updatePayload = {
      firstName: formValue.firstName.trim(),
      lastName: formValue.lastName.trim(),
      phone: formValue.phone || null,
      dateOfBirth: formValue.dateOfBirth || null,
      gender: formValue.gender || null,
      preferredLanguage: formValue.preferredLanguage,
    };

    this.http.put(this.apiUrl, updatePayload)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (response: any) => {
          this.profile = response;
          this.successMessage = 'Profile updated successfully!';
          setTimeout(() => {
            this.isEditing = false;
            this.successMessage = '';
            this.cdr.markForCheck();
          }, 2000);
        },
        error: (err) => {
          this.errorMessage = err?.error?.error || 'Failed to update profile. Please try again.';
          console.error('Profile update error:', err);
        }
      });
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }
}

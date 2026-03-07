import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DocumentUploadService } from './document-upload.service';
import { fadeInAnimation } from '../animations/fade-in.animation';

@Component({
  selector: 'app-upload-document',
  standalone: true,
  templateUrl: './upload-document.component.html',
  styleUrls: ['./upload-document.component.scss'],
  animations: [fadeInAnimation]
})
export class UploadDocumentComponent {
  uploadForm: FormGroup;
  uploadSuccess: boolean = false;
  uploadError: string | null = null;

  constructor(private fb: FormBuilder, private documentUploadService: DocumentUploadService) {
    this.uploadForm = this.fb.group({
      file: [null, Validators.required]
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadForm.patchValue({
        file: file
      });
    }
  }

  onSubmit() {
    if (this.uploadForm.valid) {
      const formData = new FormData();
      formData.append('file', this.uploadForm.get('file')?.value);
      this.documentUploadService.uploadDocument(formData).subscribe({
        next: () => {
          this.uploadSuccess = true;
          this.uploadError = null;
          this.uploadForm.reset();
        },
        error: (err) => {
          this.uploadError = 'Upload failed. Please try again.';
          this.uploadSuccess = false;
        }
      });
    }
  }
}

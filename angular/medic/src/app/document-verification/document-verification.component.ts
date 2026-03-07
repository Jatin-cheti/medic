import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DocumentService } from '../services/document.service';
import { Document } from '../models/document.model';
import { Observable } from 'rxjs';
import { fadeInAnimation } from '../animations/fade-in.animation';

@Component({
  selector: 'app-document-verification',
  standalone: true,
  templateUrl: './document-verification.component.html',
  styleUrls: ['./document-verification.component.scss'],
  animations: [fadeInAnimation]
})
export class DocumentVerificationComponent implements OnInit {
  documents$: Observable<Document[]>;
  approvalForm: FormGroup;

  constructor(private documentService: DocumentService, private fb: FormBuilder) {
    this.approvalForm = this.fb.group({
      action: ['', Validators.required],
      comment: ['']
    });
  }

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.documents$ = this.documentService.getDocumentsForVerification();
  }

  onApprove(documentId: string): void {
    this.submitAction(documentId, 'approve');
  }

  onReject(documentId: string): void {
    this.submitAction(documentId, 'reject');
  }

  onRequestChanges(documentId: string): void {
    this.submitAction(documentId, 'request-changes');
  }

  private submitAction(documentId: string, action: string): void {
    const comment = this.approvalForm.get('comment')?.value;
    this.documentService.updateDocumentStatus(documentId, action, comment).subscribe(() => {
      this.loadDocuments();
      this.approvalForm.reset();
    });
  }
}

import { Component, Input } from '@angular/core';
import { DocumentService } from '../../services/document.service';
import { Document } from '../../models/document.model';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-document-verification-card',
  standalone: true,
  templateUrl: './document-verification-card.component.html',
  styleUrls: ['./document-verification-card.component.scss']
})
export class DocumentVerificationCardComponent {
  @Input() document!: Document;

  constructor(private documentService: DocumentService, private notificationService: NotificationService) {}

  approveDocument() {
    this.documentService.approveDocument(this.document.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Document approved successfully!');
        this.document.status = 'Approved';
      },
      error: () => this.notificationService.showError('Failed to approve document.')
    });
  }

  rejectDocument() {
    this.documentService.rejectDocument(this.document.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Document rejected successfully!');
        this.document.status = 'Rejected';
      },
      error: () => this.notificationService.showError('Failed to reject document.')
    });
  }

  requestChanges() {
    this.documentService.requestChanges(this.document.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Change request sent successfully!');
        this.document.status = 'Changes Requested';
      },
      error: () => this.notificationService.showError('Failed to request changes.')
    });
  }
}

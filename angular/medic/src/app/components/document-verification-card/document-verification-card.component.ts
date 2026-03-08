import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DocumentService } from '../../services/document.service';
import { Document } from '../../models/document.model';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-document-verification-card',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './document-verification-card.component.html',
  styleUrls: ['./document-verification-card.component.scss']
})
export class DocumentVerificationCardComponent {
  @Input() document!: Document;

  constructor(private documentService: DocumentService, private notificationService: NotificationService) {}

  viewDocument(): void {
    window.open(`/api/documents/${this.document.id}/preview`, '_blank');
  }

  approveDocument() {
    this.documentService.approveDocument(this.document.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Document approved successfully!');
        this.document.status = 'approved';
      },
      error: () => this.notificationService.showError('Failed to approve document.')
    });
  }

  rejectDocument() {
    this.documentService.rejectDocument(this.document.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Document rejected successfully!');
        this.document.status = 'rejected';
      },
      error: () => this.notificationService.showError('Failed to reject document.')
    });
  }

  requestChanges() {
    this.documentService.requestChanges(this.document.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Change request sent successfully!');
        this.document.status = 'pending';
      },
      error: () => this.notificationService.showError('Failed to request changes.')
    });
  }
}

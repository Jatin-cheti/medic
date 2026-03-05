import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-document-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-verification.component.html',
  styleUrls: ['./document-verification.component.scss'],
})
export class DocumentVerificationComponent implements OnInit {
  documents: any[] = [];
  total = 0;
  page = 1;
  limit = 20;
  statusFilter = 'pending';
  isLoading = false;
  error = '';

  // Inline rejection modal state
  rejectingDocId: number | null = null;
  rejectionReason = '';
  actionError = '';
  actionLoading = false;

  readonly statusTabs = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'all', label: 'All' },
  ];

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.isLoading = true;
    this.error = '';
    this.adminService.getDocuments(this.statusFilter, this.page).subscribe({
      next: (res: any) => {
        this.documents = res.data;
        this.total = res.total;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load documents.';
        this.isLoading = false;
      },
    });
  }

  setStatus(status: string) {
    this.statusFilter = status;
    this.page = 1;
    this.loadDocuments();
  }

  approve(docId: number) {
    this.actionLoading = true;
    this.actionError = '';
    this.adminService.approveDocument(docId).subscribe({
      next: () => {
        this.actionLoading = false;
        this.loadDocuments();
      },
      error: (err) => {
        this.actionError = err.message || 'Approval failed.';
        this.actionLoading = false;
      },
    });
  }

  openReject(docId: number) {
    this.rejectingDocId = docId;
    this.rejectionReason = '';
    this.actionError = '';
  }

  cancelReject() {
    this.rejectingDocId = null;
    this.rejectionReason = '';
    this.actionError = '';
  }

  confirmReject() {
    if (!this.rejectionReason.trim()) {
      this.actionError = 'Please provide a rejection reason.';
      return;
    }
    this.actionLoading = true;
    this.actionError = '';
    this.adminService.rejectDocument(this.rejectingDocId!, this.rejectionReason).subscribe({
      next: () => {
        this.actionLoading = false;
        this.rejectingDocId = null;
        this.rejectionReason = '';
        this.loadDocuments();
      },
      error: (err) => {
        this.actionError = err.message || 'Rejection failed.';
        this.actionLoading = false;
      },
    });
  }

  prevPage() {
    if (this.page > 1) { this.page--; this.loadDocuments(); }
  }

  nextPage() {
    if (this.page * this.limit < this.total) { this.page++; this.loadDocuments(); }
  }

  get totalPages() {
    return Math.ceil(this.total / this.limit);
  }
}

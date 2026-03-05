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

  // Inline action state
  actionDoc: { id: number; mode: 'reject' | 'request' } | null = null;
  actionNotes = '';
  actionError = '';
  actionLoading = false;
  successMessage = '';

  readonly statusTabs = [
    { value: 'pending',            label: 'Pending' },
    { value: 'approved',           label: 'Approved' },
    { value: 'rejected',           label: 'Rejected' },
    { value: 'changes_requested',  label: 'Changes Requested' },
    { value: 'all',                label: 'All' },
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
    this.successMessage = '';
    this.adminService.approveDocument(docId).subscribe({
      next: () => {
        this.successMessage = 'Document approved.';
        this.actionLoading = false;
        this.actionDoc = null;
        this.loadDocuments();
      },
      error: (err) => {
        this.actionError = err.message || 'Approval failed.';
        this.actionLoading = false;
      },
    });
  }

  openAction(docId: number, mode: 'reject' | 'request') {
    this.actionDoc = { id: docId, mode };
    this.actionNotes = '';
    this.actionError = '';
    this.successMessage = '';
  }

  cancelAction() {
    this.actionDoc = null;
    this.actionNotes = '';
    this.actionError = '';
  }

  confirmAction() {
    if (!this.actionNotes.trim()) {
      this.actionError = 'Please provide a reason / notes.';
      return;
    }
    if (!this.actionDoc) return;

    this.actionLoading = true;
    this.actionError = '';
    this.successMessage = '';

    const obs = this.actionDoc.mode === 'reject'
      ? this.adminService.rejectDocument(this.actionDoc.id, this.actionNotes)
      : this.adminService.requestChanges(this.actionDoc.id, this.actionNotes);

    obs.subscribe({
      next: () => {
        this.successMessage = this.actionDoc!.mode === 'reject' ? 'Document rejected.' : 'Changes requested.';
        this.actionLoading = false;
        this.actionDoc = null;
        this.actionNotes = '';
        this.loadDocuments();
      },
      error: (err) => {
        this.actionError = err.message || 'Action failed.';
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

  isActionable(doc: any): boolean {
    return doc.status === 'pending' || doc.status === 'changes_requested';
  }

  showActionsCol(): boolean {
    return ['pending', 'changes_requested', 'all'].includes(this.statusFilter);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-doctor-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './doctor-detail.component.html',
  styleUrls: ['./doctor-detail.component.scss'],
})
export class DoctorDetailComponent implements OnInit {
  doctor: any = null;
  documents: any[] = [];
  specialties: any[] = [];
  isLoading = true;
  error = '';

  // Action state
  actionError = '';
  actionLoading = false;
  rejectingDocId: number | null = null;
  rejectionReason = '';
  requestingDoc: { id: number; mode: 'reject' | 'request' } | null = null;
  actionNotes = '';
  successMessage = '';

  private doctorId = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    this.doctorId = parseInt(this.route.snapshot.paramMap.get('id') || '0');
    if (!this.doctorId) {
      this.error = 'Invalid doctor ID';
      this.isLoading = false;
      return;
    }
    this.load();
  }

  load() {
    this.isLoading = true;
    this.error = '';
    this.adminService.getDoctorById(this.doctorId).subscribe({
      next: (res: any) => {
        this.doctor = res.doctor;
        this.documents = res.documents;
        this.specialties = res.specialties;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load doctor profile.';
        this.isLoading = false;
      },
    });
  }

  approve(docId: number) {
    this.actionLoading = true;
    this.actionError = '';
    this.successMessage = '';
    this.adminService.approveDocument(docId).subscribe({
      next: () => {
        this.successMessage = 'Document approved successfully.';
        this.actionLoading = false;
        this.requestingDoc = null;
        this.load();
      },
      error: (err) => {
        this.actionError = err.message || 'Approval failed.';
        this.actionLoading = false;
      },
    });
  }

  openAction(docId: number, mode: 'reject' | 'request') {
    this.requestingDoc = { id: docId, mode };
    this.actionNotes = '';
    this.actionError = '';
    this.successMessage = '';
  }

  cancelAction() {
    this.requestingDoc = null;
    this.actionNotes = '';
  }

  confirmAction() {
    if (!this.actionNotes.trim()) {
      this.actionError = 'Please provide a reason / notes.';
      return;
    }
    if (!this.requestingDoc) return;

    this.actionLoading = true;
    this.actionError = '';
    this.successMessage = '';

    const obs = this.requestingDoc.mode === 'reject'
      ? this.adminService.rejectDocument(this.requestingDoc.id, this.actionNotes)
      : this.adminService.requestChanges(this.requestingDoc.id, this.actionNotes);

    obs.subscribe({
      next: () => {
        this.successMessage = this.requestingDoc!.mode === 'reject'
          ? 'Document rejected.'
          : 'Change request sent.';
        this.actionLoading = false;
        this.requestingDoc = null;
        this.actionNotes = '';
        this.load();
      },
      error: (err) => {
        this.actionError = err.message || 'Action failed.';
        this.actionLoading = false;
      },
    });
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  statusClass(status: string): string {
    return status?.toLowerCase().replace('_', '-') || 'pending';
  }

  get isActive(): boolean {
    return Number(this.doctor?.is_active) === 1 && Number(this.doctor?.is_suspended) !== 1;
  }

  get isVerified(): boolean {
    return Number(this.doctor?.doc_verified) === 1;
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../services/admin.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss'],
})
export class PatientListComponent implements OnInit {
  patients: any[] = [];
  total = 0;
  page = 1;
  limit = 20;
  search = '';
  isLoading = false;
  error = '';

  private searchSubject = new Subject<string>();

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.searchSubject
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(() => {
        this.page = 1;
        this.loadPatients();
      });
    this.loadPatients();
  }

  loadPatients() {
    this.isLoading = true;
    this.error = '';
    this.adminService.getPatients(this.page, this.search).subscribe({
      next: (res: any) => {
        this.patients = res.data;
        this.total = res.total;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load patients.';
        this.isLoading = false;
      },
    });
  }

  onSearch() {
    this.searchSubject.next(this.search);
  }

  prevPage() {
    if (this.page > 1) { this.page--; this.loadPatients(); }
  }

  nextPage() {
    if (this.page * this.limit < this.total) { this.page++; this.loadPatients(); }
  }

  get totalPages() {
    return Math.ceil(this.total / this.limit);
  }
}

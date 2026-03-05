import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './doctor-list.component.html',
  styleUrls: ['./doctor-list.component.scss'],
})
export class DoctorListComponent implements OnInit {
  doctors: any[] = [];
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
        this.loadDoctors();
      });
    this.loadDoctors();
  }

  loadDoctors() {
    this.isLoading = true;
    this.error = '';
    this.adminService.getDoctors(this.page, this.search).subscribe({
      next: (res: any) => {
        this.doctors = res.data;
        this.total = res.total;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load doctors.';
        this.isLoading = false;
      },
    });
  }

  onSearch() {
    this.searchSubject.next(this.search);
  }

  prevPage() {
    if (this.page > 1) { this.page--; this.loadDoctors(); }
  }

  nextPage() {
    if (this.page * this.limit < this.total) { this.page++; this.loadDoctors(); }
  }

  get totalPages() {
    return Math.ceil(this.total / this.limit);
  }

  isActive(doc: any): boolean {
    return Number(doc.is_active) === 1 && Number(doc.is_suspended) !== 1;
  }
}

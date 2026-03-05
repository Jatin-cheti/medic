import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-symptom-checker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './symptom-checker.component.html',
  styleUrls: ['./symptom-checker.component.scss'],
})
export class AdminSymptomCheckerComponent implements OnInit {
  // These would be fetched from a real analytics endpoint.
  // Showing placeholder data for now.
  totalChecks = 0;
  recentChecks: { date: string; symptom: string }[] = [];
  isLoading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    // TODO: replace with real analytics API call
    setTimeout(() => {
      this.totalChecks = 0;
      this.recentChecks = [];
      this.isLoading = false;
    }, 600);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface Appointment {
  id: number;
  uuid: string;
  scheduled_at: string;
  status: string;
  doctor_first_name: string;
  doctor_last_name: string;
  consultation_fee: number;
  specialty: string;
}

interface Doctor {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_id: number;
  consultation_fee: number;
  rating: number;
  total_consultations: number;
  specialties: string;
}

interface Conversation {
  id: number;
  uuid: string;
  subject: string;
  last_message: string;
  updated_at: string;
  first_name: string;
  last_name: string;
}

interface PatientInfo {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  preferred_language: string;
}

interface DashboardData {
  patient: PatientInfo;
  appointments: Appointment[];
  doctors: Doctor[];
  conversations: Conversation[];
  stats: {
    totalAppointments: number;
    totalDoctors: number;
    recentChats: number;
  };
}

@Component({
  selector: 'app-home-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-screen.component.html',
  styleUrls: ['./home-screen.component.scss']
})
export class HomeScreenComponent implements OnInit {
  dashboardData: DashboardData | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading = true;
    this.error = null;

    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.http.get<DashboardData>('/api/patient/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Dashboard load error:', err);
        if (err.status === 401) {
          this.router.navigate(['/auth/login']);
        } else {
          this.error = 'Failed to load dashboard';
        }
        this.loading = false;
      }
    });
  }

  getInitials(firstName: string, lastName: string): string {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  navigateToAppointments() {
    this.router.navigate(['/patient/appointments']);
  }

  navigateToDoctors() {
    this.router.navigate(['/patient/find-doctors']);
  }

  navigateToChat(conversationId: string) {
    this.router.navigate(['/patient/chat', conversationId]);
  }

  navigateToDoctor(doctorId: number) {
    this.router.navigate(['/patient/doctor', doctorId]);
  }

  bookAppointment(doctorId: number) {
    this.router.navigate(['/patient/book-appointment', doctorId]);
  }
}

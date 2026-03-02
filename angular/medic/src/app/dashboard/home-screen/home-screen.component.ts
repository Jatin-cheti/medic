import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { finalize } from 'rxjs';
import { AppLoaderComponent } from '../../shared/components/app-loader/app-loader.component';

interface Appointment {
  id: number;
  uuid: string;
  scheduled_at: string;
  appointment_date?: string;
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
  imports: [CommonModule, AppLoaderComponent],
  templateUrl: './home-screen.component.html',
  styleUrls: ['./home-screen.component.scss']
})
export class HomeScreenComponent implements OnInit {
  dashboardData: DashboardData | null = null;
  loading = true;
  error: string | null = null;
  private apiUrl = environment.apiUrl;

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
      this.loading = false;
      this.router.navigate(['/patient-login']);
      return;
    }

    this.http.get<DashboardData>(`${this.apiUrl}/api/patient/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (data) => {
        this.dashboardData = {
          patient: data?.patient || {
            id: 0,
            first_name: 'Patient',
            last_name: '',
            email: '',
            phone: '',
            gender: '',
            preferred_language: 'en',
          },
          appointments: Array.isArray(data?.appointments)
            ? data.appointments.map((appointment) => ({
                ...appointment,
                scheduled_at: appointment.scheduled_at || appointment.appointment_date || '',
              }))
            : [],
          doctors: Array.isArray(data?.doctors) ? data.doctors : [],
          conversations: Array.isArray(data?.conversations) ? data.conversations : [],
          stats: {
            totalAppointments: data?.stats?.totalAppointments ?? (data?.appointments?.length || 0),
            totalDoctors: data?.stats?.totalDoctors ?? (data?.doctors?.length || 0),
            recentChats: data?.stats?.recentChats ?? (data?.conversations?.length || 0),
          },
        };
      },
      error: (err) => {
        console.error('Dashboard load error:', err);
        if (err.status === 401) {
          this.router.navigate(['/patient-login']);
        } else {
          this.error = err?.error?.message || err?.error?.error || 'Failed to load dashboard';
        }
      }
    });
  }

  getInitials(firstName?: string, lastName?: string): string {
    const firstInitial = String(firstName || '').trim().charAt(0);
    const lastInitial = String(lastName || '').trim().charAt(0);
    const initials = `${firstInitial}${lastInitial}`.trim();
    return (initials || 'U').toUpperCase();
  }

  formatDate(dateString: string): string {
    if (!dateString) return '--';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '--';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    if (!dateString) return '--';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '--';
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

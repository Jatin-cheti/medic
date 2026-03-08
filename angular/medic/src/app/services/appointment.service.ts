import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://your-api-url.com/api/appointments';

  constructor(private http: HttpClient) {}

  getAppointments(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getUpcomingAppointments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/upcoming`);
  }

  getPastAppointments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/past`);
  }

  bookAppointment(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  sendReminder(appointmentId: string, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${appointmentId}/send-reminder`, { message });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://your-api-url.com/api/appointments';

  constructor(private http: HttpClient) {}

  sendReminder(appointmentId: string, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${appointmentId}/send-reminder`, { message });
  }
}

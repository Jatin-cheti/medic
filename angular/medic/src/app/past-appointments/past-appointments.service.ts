import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment } from './appointment.model';

@Injectable({
  providedIn: 'root'
})
export class PastAppointmentsService {
  private apiUrl = 'http://localhost:3000/api/appointments/past';

  constructor(private http: HttpClient) {}

  getPastAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.apiUrl);
  }
}

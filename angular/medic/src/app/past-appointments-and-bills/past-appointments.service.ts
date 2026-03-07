import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment } from './appointment.model';

@Injectable({
  providedIn: 'root'
})
export class PastAppointmentsService {
  private apiUrl = 'https://api.example.com/past-appointments'; // Replace with your actual API endpoint

  constructor(private http: HttpClient) {}

  getPastAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.apiUrl);
  }
}

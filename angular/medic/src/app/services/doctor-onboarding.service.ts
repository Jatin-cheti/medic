import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DoctorOnboardingService {
  private apiUrl = '/api/doctor-onboarding';

  constructor(private http: HttpClient) {}

  submitOnboarding(formData: FormData): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.apiUrl, formData);
  }
}

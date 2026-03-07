import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DoctorOnboardingService {
  private apiUrl = 'http://localhost:3000/api/doctors/onboarding';

  constructor(private http: HttpClient) {}

  uploadDocuments(data: any): Observable<any> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('experienceCertificate', data.experienceCertificate);
    formData.append('degree', data.degree);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  getUploadStatus(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/status`);
  }
}

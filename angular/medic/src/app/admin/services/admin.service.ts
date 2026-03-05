import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = `${environment.apiUrl}/api/admin`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.api}/login`, { email, password });
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.api}/stats`);
  }

  getDoctors(page = 1, search = ''): Observable<any> {
    const params = new HttpParams().set('page', String(page)).set('search', search);
    return this.http.get(`${this.api}/doctors`, { params });
  }

  getPatients(page = 1, search = ''): Observable<any> {
    const params = new HttpParams().set('page', String(page)).set('search', search);
    return this.http.get(`${this.api}/patients`, { params });
  }

  getDocuments(status = 'pending', page = 1): Observable<any> {
    const params = new HttpParams().set('status', status).set('page', String(page));
    return this.http.get(`${this.api}/doctor-documents`, { params });
  }

  approveDocument(id: number): Observable<any> {
    return this.http.post(`${this.api}/documents/${id}/approve`, {});
  }

  rejectDocument(id: number, reason: string): Observable<any> {
    return this.http.post(`${this.api}/documents/${id}/reject`, { reason });
  }

  requestChanges(id: number, notes: string): Observable<any> {
    return this.http.post(`${this.api}/documents/${id}/request-changes`, { notes });
  }

  getDoctorById(id: number): Observable<any> {
    return this.http.get(`${this.api}/doctors/${id}`);
  }

  getDoctorDocuments(doctorId: number): Observable<any> {
    return this.http.get(`${this.api}/doctor-documents`, {
      params: new HttpParams().set('doctorId', String(doctorId)).set('status', 'all'),
    });
  }

  createAdmin(data: { email: string; password: string; firstName: string; lastName: string }): Observable<any> {
    return this.http.post(`${this.api}/super/create-admin`, data);
  }
}

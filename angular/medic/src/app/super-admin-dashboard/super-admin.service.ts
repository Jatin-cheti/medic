import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class SuperAdminService {
  private apiUrl = 'http://localhost:3000/api/super-admin';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getUserStatistics(): Observable<{ doctors: number; patients: number; admins: number }> {
    return this.http.get<{ doctors: number; patients: number; admins: number }>(`${this.apiUrl}/statistics`);
  }
}

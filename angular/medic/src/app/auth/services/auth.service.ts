import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth'; // Update with your backend API URL

  constructor(private http: HttpClient) {}

  login(role: string, credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/${role}/login`, credentials);
  }
}

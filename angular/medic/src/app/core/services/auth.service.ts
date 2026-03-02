import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private api = 'http://localhost:3000/api/auth';

  private hasStorage(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  constructor(private http: HttpClient) {}

  login(data: any) {
    return this.http.post(`${this.api}/login`, data)
      .pipe(
        tap((res: any) => {
          if (this.hasStorage()) {
            if (res.token) localStorage.setItem('token', res.token);
            if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
          }
        })
      );
  }

  loginPatient(data: any) {
    return this.http.post(`${this.api}/patient/login`, data)
      .pipe(
        tap((res: any) => {
          if (this.hasStorage()) {
            if (res.token) localStorage.setItem('token', res.token);
            if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
          }
        })
      );
  }

  loginDoctor(data: any) {
    return this.http.post(`${this.api}/doctor/login`, data)
      .pipe(
        tap((res: any) => {
          if (this.hasStorage()) {
            if (res.token) localStorage.setItem('token', res.token);
            if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
          }
        })
      );
  }

  googleLogin(googleId: string, email: string, firstName: string, lastName: string) {
    return this.http.post(`${this.api}/google-callback`, { googleId, email, firstName, lastName })
      .pipe(
        tap((res: any) => {
          if (this.hasStorage()) {
            if (res.token) localStorage.setItem('token', res.token);
            if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
          }
        })
      );
  }

  googleTestLogin(email: string, firstName: string, lastName: string) {
    return this.http.post(`${this.api}/google-test`, { email, firstName, lastName })
      .pipe(
        tap((res: any) => {
          if (this.hasStorage()) {
            if (res.token) localStorage.setItem('token', res.token);
            if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
          }
        })
      );
  }

  refreshToken() {
    if (!this.hasStorage()) return null;

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    return this.http.post(`${this.api}/refresh-token`, { refreshToken })
      .pipe(
        tap((res: any) => {
          if (res.token) localStorage.setItem('token', res.token);
          if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
        })
      );
  }

  signup(data: any) {
    return this.http.post(`${this.api}/signup`, data)
      .pipe(
        tap((res: any) => {
          if (this.hasStorage()) {
            if (res.token) localStorage.setItem('token', res.token);
            if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
          }
        })
      );
  }

  signupPatient(data: any) {
    return this.http.post(`${this.api}/patient/signup`, data)
      .pipe(
        tap((res: any) => {
          if (this.hasStorage()) {
            if (res.token) localStorage.setItem('token', res.token);
            if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
          }
        })
      );
  }

  signupDoctor(data: any) {
    return this.http.post(`${this.api}/doctor/signup`, data)
      .pipe(
        tap((res: any) => {
          if (this.hasStorage()) {
            if (res.token) localStorage.setItem('token', res.token);
            if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
          }
        })
      );
  }

  logout() {
    if (this.hasStorage()) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  }

  isLoggedIn(): boolean {
    return this.hasStorage() ? !!localStorage.getItem('token') : false;
  }

  getToken(): string | null {
    return this.hasStorage() ? localStorage.getItem('token') : null;
  }

  getRefreshToken(): string | null {
    return this.hasStorage() ? localStorage.getItem('refreshToken') : null;
  }
}

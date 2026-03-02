import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { catchError, throwError, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private api = `${environment.apiUrl}/api/auth`;

  private hasStorage(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  constructor(private http: HttpClient) {}

  private handleApiError(error: HttpErrorResponse) {
    const message = this.getErrorMessage(error);
    return throwError(() => new Error(message));
  }

  getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    const httpError = error as HttpErrorResponse;
    if (httpError?.status === 0) {
      return 'Cannot connect to server. Please try again.';
    }

    if (typeof httpError?.error === 'string' && httpError.error.trim()) {
      return httpError.error;
    }

    const backendMessage =
      httpError?.error?.message ||
      httpError?.error?.error ||
      httpError?.message;

    if (backendMessage) {
      return backendMessage;
    }

    return 'Something went wrong. Please try again.';
  }

  login(data: any) {
    return this.http.post(`${this.api}/login`, data)
      .pipe(
        tap((res: any) => {
          if (this.hasStorage()) {
            if (res.token) localStorage.setItem('token', res.token);
            if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
          }
        }),
        catchError((error) => this.handleApiError(error))
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
        }),
        catchError((error) => this.handleApiError(error))
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
        }),
        catchError((error) => this.handleApiError(error))
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
        }),
        catchError((error) => this.handleApiError(error))
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
        }),
        catchError((error) => this.handleApiError(error))
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
        }),
        catchError((error) => this.handleApiError(error))
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
        }),
        catchError((error) => this.handleApiError(error))
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
        }),
        catchError((error) => this.handleApiError(error))
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
        }),
        catchError((error) => this.handleApiError(error))
      );
  }

  isLoggedIn(): boolean {
    if (!this.hasStorage()) return false;
    
    const token = localStorage.getItem('token');
    if (!token) return false;

    // Validate token is not expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      
      if (exp < now) {
        // Token expired, clear storage
        console.log('Token expired, clearing auth data');
        this.logout();
        return false;
      }
      
      return true;
    } catch (e) {
      // Invalid token format
      console.error('Invalid token format:', e);
      this.logout();
      return false;
    }
  }

  logout() {
    if (this.hasStorage()) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
    }
  }

  getToken(): string | null {
    return this.hasStorage() ? localStorage.getItem('token') : null;
  }

  getRefreshToken(): string | null {
    return this.hasStorage() ? localStorage.getItem('refreshToken') : null;
  }

  getBackendUrl(): string {
    return environment.apiUrl;
  }
}

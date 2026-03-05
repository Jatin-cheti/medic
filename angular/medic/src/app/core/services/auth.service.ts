import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { catchError, throwError, tap, BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private api = `${environment.apiUrl}/api/auth`;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private hasStorage(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  constructor(private http: HttpClient, private router: Router) {
    // Initialize auth state on service creation
    this.checkAuthState();
  }

  private checkAuthState(): void {
    const isValid = this.hasValidToken();
    this.isAuthenticatedSubject.next(isValid);
  }

  private hasValidToken(): boolean {
    if (!this.hasStorage()) return false;

    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const payload = this.decodeJwtPayload(token);
      if (!payload?.exp) return false;
      const exp = payload.exp * 1000;
      return Date.now() < exp;
    } catch {
      return false;
    }
  }

  private decodeJwtPayload(token: string): any {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) {
      throw new Error('Invalid JWT format');
    }

    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded));
  }

  private clearAuthState(): void {
    if (this.hasStorage()) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
      localStorage.removeItem('firstName');
      localStorage.removeItem('lastName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userAvatar');
    }
    this.isAuthenticatedSubject.next(false);
  }

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
            if (res.role) localStorage.setItem('role', res.role);
            this.isAuthenticatedSubject.next(true);
          }
        }),
        catchError((error) => this.handleApiError(error))
      );
  }

  loginPatient(data: any) {
    return this.http.post(`${this.api}/patient/login`, data)
      .pipe(
        tap((res: any) => {
          console.log('🔐 Auth service received login response:', { 
            hasToken: !!res.token, 
            hasRefreshToken: !!res.refreshToken,
            role: res.role 
          });
          
          if (this.hasStorage()) {
            if (res.token) {
              localStorage.setItem('token', res.token);
            }
            if (res.refreshToken) {
              localStorage.setItem('refreshToken', res.refreshToken);
            }
            if (res.role) {
              localStorage.setItem('role', res.role);
            }
            this.isAuthenticatedSubject.next(true);
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
            if (res.role) localStorage.setItem('role', res.role);
            this.isAuthenticatedSubject.next(true);
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
            if (res.role) localStorage.setItem('role', res.role);
            this.isAuthenticatedSubject.next(true);
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
            if (res.role) localStorage.setItem('role', res.role);
            this.isAuthenticatedSubject.next(true);
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
          this.isAuthenticatedSubject.next(true);
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
            if (res.role) localStorage.setItem('role', res.role);
            this.isAuthenticatedSubject.next(true);
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
            if (res.role) localStorage.setItem('role', res.role);
            this.isAuthenticatedSubject.next(true);
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
            if (res.role) localStorage.setItem('role', res.role);
            this.isAuthenticatedSubject.next(true);
          }
        }),
        catchError((error) => this.handleApiError(error))
      );
  }

  isLoggedIn(): boolean {
    if (!this.hasStorage()) return false;

    const token = localStorage.getItem('token');
    if (!token) {
      this.isAuthenticatedSubject.next(false);
      return false;
    }

    // Validate token is not expired
    try {
      const payload = this.decodeJwtPayload(token);
      if (!payload?.exp) {
        this.clearAuthState();
        return false;
      }
      const exp = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();

      if (exp < now) {
        // Token expired, clear storage
        console.log('Token expired, clearing auth data');
        this.clearAuthState();
        return false;
      }

      this.isAuthenticatedSubject.next(true);
      return true;
    } catch (e) {
      // Invalid token format
      console.error('Invalid token format:', e);
      this.clearAuthState();
      return false;
    }
  }

  logout() {
    this.clearAuthState();
    this.router.navigate(['/patient-login']);
  }

  getToken(): string | null {
    return this.hasStorage() ? localStorage.getItem('token') : null;
  }

  getRefreshToken(): string | null {
    return this.hasStorage() ? localStorage.getItem('refreshToken') : null;
  }

  getRole(): string | null {
    return this.hasStorage() ? localStorage.getItem('role') : null;
  }

  /** Called by GoogleSuccessComponent after OAuth redirect */
  handleOAuthCallback(token: string, refreshToken: string, role: string): void {
    if (this.hasStorage()) {
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('role', role);
    }
    this.isAuthenticatedSubject.next(true);
  }

  getUserFromToken(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = this.decodeJwtPayload(token);
      return {
        userId: payload.userId,
        uuid: payload.uuid,
        email: payload.email,
        phone: payload.phone,
        role: payload.role
      };
    } catch {
      return null;
    }
  }

  getBackendUrl(): string {
    return environment.apiUrl;
  }
}

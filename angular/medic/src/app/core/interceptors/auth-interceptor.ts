import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const getToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('token') : null;

const getRefreshToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

const clearAuth = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
  }
};

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = getToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !req.url.includes('/refresh-token') &&
        !req.url.includes('/login') &&
        !req.url.includes('/signup') &&
        !req.url.includes('/google')
      ) {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          clearAuth();
          inject(Router).navigateByUrl('/patient-login');
          return throwError(() => error);
        }

        const http = inject(HttpClient);
        return http
          .post<{ token: string; refreshToken?: string }>(
            `${environment.apiUrl}/api/auth/refresh-token`,
            { refreshToken }
          )
          .pipe(
            switchMap((res) => {
              if (typeof window !== 'undefined') {
                localStorage.setItem('token', res.token);
                if (res.refreshToken) {
                  localStorage.setItem('refreshToken', res.refreshToken);
                }
              }
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${res.token}` },
              });
              return next(retryReq);
            }),
            catchError((refreshErr) => {
              clearAuth();
              inject(Router).navigateByUrl('/patient-login');
              return throwError(() => refreshErr);
            })
          );
      }

      return throwError(() => error);
    })
  );
};

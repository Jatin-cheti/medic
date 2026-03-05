import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Protects routes that require authentication. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/patient-login']);
};

/** Prevents authenticated users from accessing login/signup pages. */
export const noAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return router.createUrlTree(['/home']);
  }

  return true;
};

/** Guards admin + super_admin routes. Redirects to /admin-login if not authorised. */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) return router.createUrlTree(['/admin-login']);

  const role = auth.getRole();
  if (role !== 'admin' && role !== 'super_admin') {
    return router.createUrlTree(['/admin-login']);
  }
  return true;
};

/** Guards super_admin-only routes. Redirects to /admin/dashboard if only admin. */
export const superAdminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) return router.createUrlTree(['/admin-login']);

  const role = auth.getRole();
  if (role !== 'super_admin') return router.createUrlTree(['/admin/dashboard']);
  return true;
};

/** Prevents already-logged-in admins from visiting /admin-login. */
export const adminNoAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) return true;

  const role = auth.getRole();
  if (role === 'super_admin') return router.createUrlTree(['/super-admin/dashboard']);
  if (role === 'admin') return router.createUrlTree(['/admin/dashboard']);
  return true;
};

/** @deprecated Use authGuard functional guard instead */
export class AuthGuard {
  static canActivate = authGuard;
}

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth-services';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is logged in using the computed signal
  if (authService.isLoggedIn()) {
    return true;
  }

  // User not authenticated: redirect to login page
  console.warn('Access denied: User not authenticated');
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
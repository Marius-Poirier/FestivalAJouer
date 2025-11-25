import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth-services';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  if (authService.isLoading()) {
    return true;
  }

  console.warn('Access denied: User not authenticated');
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@auth/auth-services';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  if (authService.isLoading()) {
    return true;
  }

  if (!authService.isLoggedIn()) {
    console.warn('Access denied: User not authenticated');
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  console.warn('Access denied: Admin privileges required');
  return router.createUrlTree(['/home']);
};
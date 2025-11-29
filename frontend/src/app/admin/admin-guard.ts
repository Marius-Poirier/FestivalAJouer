import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@auth/auth-services';

export const adminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

  // Check if user is authenticated first
    if (!authService.isLoggedIn()) {
    console.warn('Access denied: User not authenticated');
    return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
    });
    }

  // Check if user has admin role
    if (authService.isAdmin()) {
    return true;
    }

  // User is authenticated but not admin: redirect to home
    console.warn('Access denied: Admin privileges required');
    return router.createUrlTree(['/home']);
};
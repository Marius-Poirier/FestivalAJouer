import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@auth/auth-services';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si déjà loggé → OK
  if (authService.isLoggedIn()) return true;

  // Sinon → on vérifie la session côté backend
  await authService.whoamiOnce();

  // Après whoami : si pas log → redirection vers /login
  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  return true;
};
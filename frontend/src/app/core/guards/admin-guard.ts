import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth-services';

export const adminGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAdminNow = () => {
    const user = authService.currentUser();
    const role = user?.role;

    if (!role) return false;

    if (typeof role === 'string') {
      return role.toLowerCase() === 'admin';
    }

    // si jamais c'est ton enum RoleUtilisateur
    // return role === RoleUtilisateur.ADMIN;
    return false;
  };

  // 1) Déjà admin en mémoire → OK
  if (isAdminNow()) {
    return true;
  }

  // 2) Sinon, on va vérifier la session auprès du backend
  await authService.whoamiOnce();

  // 3) Après whoami : re-check
  if (isAdminNow()) {
    return true;
  }

  // 4) Pas connecté → vers /login
  if (!authService.isLoggedIn()) {
    console.warn('Access denied: User not authenticated');
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  // 5) Connecté mais pas admin → vers /home
  console.warn('Access denied: Admin privileges required');
  return router.createUrlTree(['/home']);
};
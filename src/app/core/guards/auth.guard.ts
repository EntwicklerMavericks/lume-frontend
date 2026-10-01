import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para rotas administrativas (/admin) — exige login E role ADMIN
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.currentUser()?.role === 'ADMIN') {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};

/**
 * Guard para rotas do cliente na loja (/conta/pedidos, etc.) — exige login
 */
export const customerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/conta/login'], {
    queryParams: { returnUrl: state.url },
  });
};

/**
 * Alias para manter compatibilidade com importações antigas
 */
export const authGuard = adminGuard;

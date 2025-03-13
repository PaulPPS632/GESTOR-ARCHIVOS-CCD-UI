import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { catchError, map, of, tap } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const rolesPermitidos: string[] = route.data['roles'];
  return authService.isLoggedIn().pipe(
    tap((res) => {
      if (res.estado) {
        // Actualiza el estado del usuario en AuthService
        authService.usuarioSubject.next(res.user);
      }
    }),
    map((res) => {
      if (res.estado) {
        if (rolesPermitidos.includes(res.rol)) {
          return true;
        } else {
          // Rol no permitido
          return router.createUrlTree(['/login']);
        }
      } else {
        // No autenticado
        return router.createUrlTree(['/login']);
      }
    }),
    catchError(() => {
      // En caso de error, redirigir a login
      return of(router.createUrlTree(['/login']));
    })
  );
};

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const isLoggedIn = await firstValueFrom(authService.isAuthenticated());
    if(isLoggedIn) return true;
    return router.createUrlTree(['/login']);
};
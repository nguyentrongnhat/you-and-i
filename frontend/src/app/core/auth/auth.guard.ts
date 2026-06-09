import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { firstValueFrom } from 'rxjs';
import { ROUTE_PATHS } from '../constants/route-paths';
import { PlatformService } from '../../services/platform.service';

export const authGuard: CanActivateFn = async (route, state) => {
    const platformService = inject(PlatformService);
    if (!platformService.isBrowser()) {
        return true; // Allow access on the server side
    }

    const authService = inject(AuthService);
    const router = inject(Router);
    const isLoggedIn = await firstValueFrom(authService.isAuthenticated());
    if(isLoggedIn) return true;
    return router.createUrlTree([ROUTE_PATHS.AUTH.children.LOGIN.fullPath]);
};
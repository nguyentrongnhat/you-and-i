import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { firstValueFrom } from 'rxjs';
import { ROUTE_PATHS } from '../constants/route-paths';
import { PlatformService } from '../../services/platform.service';
import { LoaderService } from '../../services/loader.service';
import { SessionStorageService } from '../../services/session-storage.service';
import { STORAGE_KEY } from '../enums';

export const authGuard: CanActivateFn = async (route, state) => {
    const loaderService = inject(LoaderService);
    const platformService = inject(PlatformService);
    const authService = inject(AuthService);
    const router = inject(Router);
    const sessionStorageService = inject(SessionStorageService);
    
    loaderService.show();
    
    if (!platformService.isBrowser()) {
        return true; // Allow access on the server side
    }

    const isLoggedIn = await firstValueFrom(authService.isAuthenticated());
    if(isLoggedIn) return true;
    sessionStorageService.setItem(STORAGE_KEY.REDIRECT_URL, state.url);
    return router.createUrlTree([ROUTE_PATHS.AUTH.children.LOGIN.fullPath]);
};
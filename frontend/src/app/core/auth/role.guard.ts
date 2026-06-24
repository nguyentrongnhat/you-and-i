import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ROLE } from '../enums';
import { resolveHomeRouteForRoles } from '../constants/access-control';
import { UserService } from '../../features/user-management/services/user.service';
import { AuthService } from '../../features/auth/services/auth.service';
import { PlatformService } from '../../services/platform.service';
import { LoaderService } from '../../services/loader.service';

/**
 * Role-based access guard.
 *
 * Reads the list of allowed roles from the route's `data.roles` and only lets
 * the user through when one of their roles matches. When access is denied the
 * user is redirected to the landing route appropriate for their role.
 *
 * Routes without a `data.roles` entry are treated as open to any authenticated
 * user (authentication itself is enforced by `authGuard`).
 */
export const roleGuard: CanActivateFn = async (route, state) => {
    const userService = inject(UserService);
    const authService = inject(AuthService);
    const platformService = inject(PlatformService);
    const loaderService = inject(LoaderService);
    const router = inject(Router);

    // Roles are only known in the browser (JWT is parsed after auth). On the
    // server let the request through; the browser re-runs the guard.
    if (!platformService.isBrowser()) {
        return true;
    }

    const allowedRoles = (route.data['roles'] as ROLE[] | undefined) ?? [];
    if (allowedRoles.length === 0) {
        return true;
    }

    // On a full reload this guard can run before authGuard has finished
    // refreshing the session, so roles would still be empty. Resolve auth first
    // so the user keeps the route they reloaded on instead of being bounced home.
    if (!userService.currentUser()) {
        await firstValueFrom(authService.isAuthenticated());
    }

    if (userService.hasRoles(allowedRoles, 'OR')) {
        return true;
    }

    const fallbackRoute = resolveHomeRouteForRoles(userService.userRoles());
    const currentPath = state.url.split('?')[0].replace(/^\//, '');

    // Avoid an infinite redirect loop when the fallback resolves to the very
    // route that is being denied (e.g. a user whose roles match nothing).
    if (fallbackRoute === currentPath) {
        return true;
    }

    // The blocked navigation is cancelled here, so the loader started by
    // authGuard for that navigation must be cleared to avoid an endless spinner.
    // The redirect target re-shows/hides the loader through its own lifecycle.
    loaderService.hide();

    // Parse the full path so multi-segment routes (e.g. "game/find-number-game")
    // resolve correctly instead of being treated as a single encoded segment.
    return router.parseUrl(fallbackRoute);
};

import { ROLE } from '../enums';
import { ROUTE_PATHS } from './route-paths';

/**
 * Centralized role-based access configuration.
 *
 * Single source of truth describing which roles may enter a route group and
 * where each role should be redirected when access is denied.
 */

/** Every role allowed in the system. */
export const ALL_ROLES: ROLE[] = [
    ROLE.SUPER_ADMIN,
    ROLE.ADMIN,
    ROLE.USER,
    ROLE.GUEST
];

/** Every authenticated role except guests. */
export const NON_GUEST_ROLES: ROLE[] = [
    ROLE.SUPER_ADMIN,
    ROLE.ADMIN,
    ROLE.USER
];

/**
 * Default landing route per role, used as the redirect target when a user
 * tries to reach a route they are not allowed to access.
 */
export const ROLE_HOME_ROUTE: Partial<Record<ROLE, string>> = {
    [ROLE.GUEST]: ROUTE_PATHS.GAME.children.FIND_NUMBER_GAME.children.START_SCREEN.fullPath
};

/** Fallback landing route for any authenticated, non-guest role. */
export const DEFAULT_HOME_ROUTE = ROUTE_PATHS.HOME.fullPath;

/**
 * Resolve the most appropriate landing route for a set of roles. Restricted
 * roles (e.g. guest) take priority so they never get bounced to a page they
 * cannot access.
 */
export function resolveHomeRouteForRoles(roles: string[]): string {
    const isGuestOnly = roles.includes(ROLE.GUEST)
        && !NON_GUEST_ROLES.some(role => roles.includes(role));

    if (isGuestOnly) {
        return ROLE_HOME_ROUTE[ROLE.GUEST] ?? DEFAULT_HOME_ROUTE;
    }

    return DEFAULT_HOME_ROUTE;
}

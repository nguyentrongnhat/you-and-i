import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { browserOnlyMatchGuard } from './core/auth/browser-only-match.guard';
import { ROUTE_PATHS } from './core/constants/route-paths';
import { LAYOUT } from './core/enums';

export const routes: Routes = [
  {
    path: ROUTE_PATHS.HOME,
    loadComponent: () => import('./features/dashboard/dashboard').then(c => c.Dashboard),
    canMatch: [browserOnlyMatchGuard],
    canActivate: [authGuard],
    data: {
      animation: 'DashboardPage',
      layout: LAYOUT.LAYOUT_1
    }
  },
  {
    path: ROUTE_PATHS.LOGIN,
    loadComponent: () => import('./features/auth/login/login').then(c => c.Login),
    data: {
      animation: 'LoginPage',
      layout: LAYOUT.EMPTY_LAYOUT
    }
  },
  {
    path: ROUTE_PATHS.SIGNUP,
    loadComponent: () => import('./features/auth/signup/signup').then(c => c.Signup),
    data: {
      animation: 'SignUpPage',
      layout: LAYOUT.EMPTY_LAYOUT
    }
  },
  {
    path: ROUTE_PATHS.VERIFY_ACCOUNT,
    loadComponent: () => import('./features/auth/verify-account/verify-account').then(c => c.VerifyAccount),
    data: {
      animation: 'SignUpPage',
      layout: LAYOUT.EMPTY_LAYOUT
    }
  },
  {
    path: ROUTE_PATHS.FIND_NUMBER_GAME,
    loadComponent: () => import('./features/games/find-number-game/find-number-game').then(c => c.FindNumberGame),
    canMatch: [browserOnlyMatchGuard],
    canActivate: [authGuard],
    data: {
      animation: 'SignUpPage',
      layout: LAYOUT.LAYOUT_1
    }
  },
  {
    path: ROUTE_PATHS.USER_MANAGEMENT,
    loadComponent: () => import('./features/user-management/user-management').then(c => c.UserManagement),
    canMatch: [browserOnlyMatchGuard],
    canActivate: [authGuard],
    data: {
      animation: 'SignUpPage',
      layout: LAYOUT.LAYOUT_1
    }
  },
  {
    path: '**',
    redirectTo: ''
  }
];
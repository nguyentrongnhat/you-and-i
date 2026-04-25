import { Routes } from '@angular/router';
import { LAYOUT } from './core/enums';
import { ROUTE_PATHS } from './core/constants/route-paths';

export const routes: Routes = [
  {
    path: ROUTE_PATHS.HOME,
    loadComponent: () => import('./features/dashboard/dashboard').then(c => c.Dashboard),
    data: {
      animation: 'DashboardPage',
      layout: LAYOUT.LAYOUT_1
    }
  },
  {
    path: 'layout2',
    loadComponent: () => import('./features/dashboard/dashboard').then(c => c.Dashboard),
    data: {
      animation: 'DashboardPage',
      layout: LAYOUT.LAYOUT_2
    }
  },
  {
    path: 'layout3',
    loadComponent: () => import('./features/dashboard/dashboard').then(c => c.Dashboard),
    data: {
      animation: 'DashboardPage',
      layout: LAYOUT.LAYOUT_3
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
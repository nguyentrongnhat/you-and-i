import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { ROUTE_PATHS } from './core/constants/route-paths';
import { LAYOUT } from './core/enums';

export const routes: Routes = [
  {
    path: ROUTE_PATHS.HOME.path,
    loadComponent: () => import('./features/dashboard/dashboard').then(c => c.Dashboard),
    canActivate: [authGuard],
    data: {
      animation: 'DashboardPage',
      layout: LAYOUT.LAYOUT_1
    }
  },
  {
    path: ROUTE_PATHS.AUTH.path,
    children: [
      {
        path: ROUTE_PATHS.AUTH.children.LOGIN.path,
        loadComponent: () => import('./features/auth/login/login').then(c => c.Login),
        data: {
          animation: 'LoginPage',
          layout: LAYOUT.EMPTY_LAYOUT
        }
      },
      {
        path: ROUTE_PATHS.AUTH.children.SIGNUP.path,
        loadComponent: () => import('./features/auth/signup/signup').then(c => c.Signup),
        data: {
          animation: 'SignUpPage',
          layout: LAYOUT.EMPTY_LAYOUT
        }
      },
      {
        path: ROUTE_PATHS.AUTH.children.VERIFY_ACCOUNT.path,
        loadComponent: () => import('./features/auth/verify-account/verify-account').then(c => c.VerifyAccount),
        data: {
          animation: 'SignUpPage',
          layout: LAYOUT.EMPTY_LAYOUT
        }
      }
    ]
  },
  // Game group: /game/find-number-game
  {
    path: ROUTE_PATHS.GAME.path,
    canActivate: [authGuard],
    children: [
      {
        path: ROUTE_PATHS.GAME.children.FIND_NUMBER_GAME.path,
        children: [
          {
            path: ROUTE_PATHS.GAME.children.FIND_NUMBER_GAME.children.START_SCREEN.path,
            loadComponent: () => import('./features/games/find-number-game/pages/game-start-screen/game-start-screen').then(c => c.GameStartScreen),
            data: {
              animation: 'SignUpPage',
              layout: LAYOUT.LAYOUT_1
            }
          },
          {
            path: ROUTE_PATHS.GAME.children.FIND_NUMBER_GAME.children.PLAY_GAME_SCREEN.path,
            loadComponent: () => import('./features/games/find-number-game/pages/game-play-screen/game-play-screen').then(c => c.GamePlayScreen),
            data: {
              animation: 'SignUpPage',
              layout: LAYOUT.EMPTY_LAYOUT
            }
          },
          {
            path: ROUTE_PATHS.GAME.children.FIND_NUMBER_GAME.children.SUMMARY_GAME_SCREEN.path,
            loadComponent: () => import('./features/games/find-number-game/pages/game-result-screen/game-result-screen').then(c => c.GameResultScreen),
            data: {
              animation: 'SignUpPage',
              layout: LAYOUT.LAYOUT_1
            }
          }
        ],
      }
    ]
  },
  {
    path: ROUTE_PATHS.USER.path,
    canActivate: [authGuard],
    children: [
        {
          path: ROUTE_PATHS.USER.children.MANAGEMENT.path,
          loadComponent: () => import('./features/user-management/pages/user-management/user-management').then(c => c.UserManagement),
          data: {
            animation: 'SignUpPage',
            layout: LAYOUT.LAYOUT_1
          }
        },
        {
          path: ROUTE_PATHS.USER.children.DETAIL.path,
          loadComponent: () => import('./features/user-management/pages/user-detail/user-detail').then(c => c.UserDetail),
          data: {
            animation: 'UserDetailsPage',
            layout: LAYOUT.LAYOUT_1
          }
        }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
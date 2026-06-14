import { RenderMode, ServerRoute } from '@angular/ssr';
import { ROUTE_PATHS } from './core/constants/route-paths';

export const serverRoutes: ServerRoute[] = [
  {
    path: ROUTE_PATHS.USER.children.DETAIL.fullPath,
    renderMode: RenderMode.Server
  },
  {
    path: ROUTE_PATHS.GAME.children.FIND_NUMBER_GAME.children.PLAY_GAME_SCREEN.fullPath,
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];

import { inject, Injectable } from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";
import { ROUTE_PATHS } from "../core/constants/route-paths";

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private readonly router = inject(Router);

  /** Navigate to the dashboard / home page. */
  goToHome(extras?: NavigationExtras): Promise<boolean> {
    return this.navigate(ROUTE_PATHS.HOME.fullPath, extras);
  }

  /** Navigate to the login page. */
  goToLogin(extras?: NavigationExtras): Promise<boolean> {
    return this.navigate(ROUTE_PATHS.AUTH.children.LOGIN.fullPath, extras);
  }

  /** Navigate to the signup page. */
  goToSignup(extras?: NavigationExtras): Promise<boolean> {
    return this.navigate(ROUTE_PATHS.AUTH.children.SIGNUP.fullPath, extras);
  }

  /** Navigate to the verify account page. */
  goToVerifyAccount(extras?: NavigationExtras): Promise<boolean> {
    return this.navigate(ROUTE_PATHS.AUTH.children.VERIFY_ACCOUNT.fullPath, extras);
  }

  /** Navigate to the find-number-game start screen. */
  goToFindNumberGameStart(extras?: NavigationExtras): Promise<boolean> {
    return this.navigate(
      ROUTE_PATHS.GAME.children.FIND_NUMBER_GAME.children.START_SCREEN.fullPath,
      extras
    );
  }

  /** Navigate to the find-number-game play screen for a given game. */
  goToFindNumberGamePlay(gameId: string, extras?: NavigationExtras): Promise<boolean> {
    return this.navigateByCommands(
      [
        ROUTE_PATHS.GAME.path,
        ROUTE_PATHS.GAME.children.FIND_NUMBER_GAME.path,
        'play',
        gameId
      ],
      extras
    );
  }

  /** Navigate to the find-number-game summary screen for a given game. */
  goToFindNumberGameSummary(gameId: string, extras?: NavigationExtras): Promise<boolean> {
    return this.navigateByCommands(
      [
        ROUTE_PATHS.GAME.path,
        ROUTE_PATHS.GAME.children.FIND_NUMBER_GAME.path,
        'summary',
        gameId
      ],
      extras
    );
  }

  /** Navigate to the user management page. */
  goToUserManagement(extras?: NavigationExtras): Promise<boolean> {
    return this.navigate(ROUTE_PATHS.USER.children.MANAGEMENT.fullPath, extras);
  }

  /** Navigate to the user detail page for a given user. */
  goToUserDetail(id: string, extras?: NavigationExtras): Promise<boolean> {
    return this.navigateByCommands(
      [ROUTE_PATHS.USER.path, 'details', id],
      extras
    );
  }

  /** Navigate to an absolute URL string. */
  navigate(url: string, extras?: NavigationExtras): Promise<boolean> {
    return this.router.navigateByUrl(url, extras);
  }

  /** Navigate using a router command array (for parameterized routes). */
  navigateByCommands(commands: unknown[], extras?: NavigationExtras): Promise<boolean> {
    return this.router.navigate(commands, extras);
  }
}
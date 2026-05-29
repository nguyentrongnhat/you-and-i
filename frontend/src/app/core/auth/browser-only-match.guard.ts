import { CanMatchFn } from "@angular/router";
import { PlatformService } from "../../services/platform.service";
import { inject } from "@angular/core";

export const browserOnlyMatchGuard: CanMatchFn = () => {
  const platformService = inject(PlatformService);
  return platformService.isBrowser();

};
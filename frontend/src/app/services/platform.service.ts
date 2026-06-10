import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { isPlatformBrowser } from '@angular/common';
@Injectable({
  providedIn: 'root',
})
export class PlatformService {

  private readonly platform = inject(Platform);

  private readonly platformId = inject(PLATFORM_ID);

  protected readonly MEDIUM_DEVICE_WIDTH = 970;

  protected MOBILE_DEVICE_WIDTH = 768;

  public isMobile(): boolean {
    return this.platform.IOS || this.platform.ANDROID;
  }

  public isMediumDevice(): boolean {
    if (!this.isBrowser()) return false;
    const deviceWidth = window.innerWidth;
    return deviceWidth < this.MEDIUM_DEVICE_WIDTH;
  }

  public isSmallMobileDevice(): boolean {
    if (!this.isBrowser()) return false;
    const deviceWidth = window.innerWidth;
    return this.isMobile() && deviceWidth < this.MOBILE_DEVICE_WIDTH;
  }

  public isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}



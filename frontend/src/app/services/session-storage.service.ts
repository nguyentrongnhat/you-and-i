import { Injectable, inject } from '@angular/core';
import { PlatformService } from './platform.service';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {
  private readonly platformService = inject(PlatformService);

  setItem(key: string, value: string): void {
    if (this.platformService.isBrowser()) {
        sessionStorage.setItem(key, value);
    }
  }

  getItem(key: string): string | null {
    if (this.platformService.isBrowser()) {
        return sessionStorage.getItem(key);
    }
    return null;
  }

  removeItem(key: string): void {
    if (this.platformService.isBrowser()) {
      sessionStorage.removeItem(key);
    }
  }

  clear(): void {
    if (this.platformService.isBrowser()) {
      sessionStorage.clear();
    }
  }
}

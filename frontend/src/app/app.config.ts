import { ApplicationConfig, provideAppInitializer, provideBrowserGlobalErrorListeners, inject } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { catchError, of } from 'rxjs';
import { routes } from './app.routes';

import Aura from '@primeuix/themes/aura';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { AuthService } from './features/auth/services/auth.service';
import { PlatformService } from './services/platform.service';

const primengConfig = {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.my-app-dark'
    }
  }
}

const refreshTokenInitializer = () => {
  const platformService = inject(PlatformService);
  if (!platformService.isBrowser()) return;
  const authService = inject(AuthService);
  return authService.refreshToken().pipe(catchError(() => of(null)));
}

export const appConfig: ApplicationConfig = {
  providers: [
    MessageService,
    providePrimeNG(primengConfig),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()), 
    provideClientHydration(withEventReplay()),
    provideAppInitializer(refreshTokenInitializer)
  ]
};


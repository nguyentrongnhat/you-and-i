import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, NgZone, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { distinctUntilChanged, Subject, debounceTime, filter } from 'rxjs';
import { environment } from '../../../../../environments/environments';
import { PlatformService } from '../../../../services/platform.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';

declare const google: any;

@Component({
  selector: 'app-google-login',
  imports: [ButtonModule, CommonModule],
  templateUrl: './google-login.html',
  styleUrl: './google-login.scss',
})
export class GoogleLogin implements OnInit {
  private zone = inject(NgZone);
  private platformService = inject(PlatformService);
  private authService = inject(AuthService);
  private codeClient: any;
  public code = input<string>('');

  private code$ = toObservable(this.code);

  ngOnInit(): void {
    this.initGetCode();
    this.code$.pipe(
      distinctUntilChanged(), 
      filter(Boolean),
      debounceTime(300)
    ).subscribe(code => {
      this.authService.loginWithGoogleAuthorizationCode(code).subscribe();
    });
  }

  private initGetCode(): void {
    if (!this.platformService.isBrowser()) return;

    const config = this.platformService.isMobile()
      ? this.getPopupConfig()
      : this.getRedirectConfig();

    this.codeClient = google.accounts.oauth2.initCodeClient(config);
  }

  private getPopupConfig(): any {
    return {
      client_id: environment.googleClientId,
      scope: 'openid email profile',
      ux_mode: 'popup',
      select_account: true,
      callback: (res: any) =>
        this.zone.run(() =>
          this.sendAuthorizationCodeToBackEndForExchangeAccessToken(res)
        ),
      error_callback: (err: any) => {
        console.error('Google OAuth error:', err);
      },
    };
  }

  private getRedirectConfig(): any {
    return {
      client_id: environment.googleClientId,
      scope: 'openid email profile',
      ux_mode: 'redirect',
      redirect_uri: environment.googleRedirectUri,
      select_account: true,
      error_callback: (err: any) => {
        console.error('Google OAuth error:', err);
      },
    };
  }

  private sendAuthorizationCodeToBackEndForExchangeAccessToken(res: any): void {
    if (res.error) {
      console.error('Google authorization failed:', res.error);
      return;
    }
    this.authService.loginWithGoogleAuthorizationCode(res.code).subscribe();
  }

  protected triggerLoginWithGoogle() {
    this.codeClient?.requestCode();
  }
}

import { HttpClient } from '@angular/common/http';
import { Component, inject, NgZone, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { environment } from '../../../../../environments/environments';
import { PlatformService } from '../../../../services/platform.service';

declare const google: any;

@Component({
  selector: 'app-google-login',
  imports: [ButtonModule, CommonModule],
  templateUrl: './google-login.html',
  styleUrl: './google-login.scss',
})
export class GoogleLogin implements OnInit {
  private http = inject(HttpClient);
  private zone = inject(NgZone);
  private router = inject(Router);
  private platformService = inject(PlatformService);

  private codeClient: any;

  ngOnInit(): void {
    this.initGetCode();
  }

  initGetCode() {
    if (!this.platformService.isBrowser()) return;
    this.codeClient = google.accounts.oauth2.initCodeClient({
      client_id: environment.googleClientId,
      scope: 'openid email profile',
      ux_mode: 'popup',
      select_account: true, // luôn hiện màn chọn tài khoản
      callback: (res: { code?: string; error?: string }) =>
        this.zone.run(() => this.onGoogleLogin(res)),
      error_callback: (err: any) => console.error('Google popup error', err),
    });
  }

  onGoogleLogin(res: any) {
    console.log(res);
  }

  loginWithGoogleCustom() {
    console.log('Custom Google login clicked');
    this.codeClient.requestCode();
  }
}

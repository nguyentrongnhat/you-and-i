import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, NgZone } from '@angular/core';

import { environment } from '../../../../../environments/environments';
import { Router } from '@angular/router';

declare const google: any;

@Component({
  selector: 'app-google-login',
  imports: [],
  templateUrl: './google-login.html',
  styleUrl: './google-login.scss',
})
export class GoogleLogin implements AfterViewInit {
  constructor(private http: HttpClient, private zone: NgZone, private router: Router) {}

  async ngAfterViewInit() {
    await this.loadGoogleScript();

    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (resp: any) => this.zone.run(() => this.onGoogleLogin(resp.credential)),
    });
    google.accounts.id.renderButton(
      document.getElementById('google-btn'),
      { theme: 'outline', size: 'large' }
    );
  }

  private loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined') {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Cannot load Google script'));
      document.head.appendChild(script);
    });
  }

  onGoogleLogin(idToken: string) {
    this.http.post<{ token: string }>('/api/auth/google', { idToken })
      .subscribe(res => {
        localStorage.setItem('token', res.token);
        this.router.navigate(['/']);
      });
  }
}
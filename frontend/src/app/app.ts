import { Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Toast } from 'primeng/toast';
import { UserService } from './services/user.service';
import { Layout1 } from './shared/layouts/components/layout1/layout1';
import { Layout2 } from './shared/layouts/components/layout2/layout2';
import { Layout3 } from './shared/layouts/components/layout3/layout3';
import { EmptyLayout } from './shared/layouts/components/empty-layout/empty-layout';
import { LAYOUT } from './core/enums';
import { AuthService } from './features/auth/services/auth.service';
import { UsernamePasswordLoginResponse } from './core/interfaces/user.dtos';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    Layout1, 
    Layout2, 
    Layout3,
    EmptyLayout,
    Toast
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  
  protected LAYOUT = LAYOUT;

  protected activeLayout = signal<string>('');

  public destroyRef = inject(DestroyRef);

  private readonly authService = inject(AuthService);


  constructor(
    public router: Router,
    public activatedRoute: ActivatedRoute,
  ) {
    effect(() => {
      const userinfo = this.authService.userInfo();
      if (!userinfo) return;
      console.log('userinfo: ', userinfo);
    })
  }


  ngOnInit(): void {
    this.getRouteData();
    this.getAccessToken();
  }

  private refreshToken() {
    this.authService.refreshToken().subscribe({
      next: (res: UsernamePasswordLoginResponse) => {
        this.authService.setAccessToken(res.accessToken);
      },
      error: err => {
        console.log('Login error: ', err);
      }
    })
  }

  private getAccessToken() {
    this.refreshToken();
  }

  private getRouteData() {
    this.router.events
    .pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((event) => {
      this.getLayoutConfigData(this.activatedRoute);
    })
  }


  // Recursive method to get the deepest child route data
  private getLayoutConfigData(route: ActivatedRoute): void {
    let child = route;
    while (child.firstChild) {
      child = child.firstChild;
    }
    child.data.subscribe((data) => {
      this.activeLayout.update(() => data['layout']);
    });
  }
}


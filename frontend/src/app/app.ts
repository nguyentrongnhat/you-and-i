import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { LAYOUT } from './core/enums';
import { Layout1 } from "./shared/layouts/layout1/layout1";
import { Layout3 } from "./shared/layouts/layout3/layout3";
import { Layout2 } from './shared/layouts/layout2/layout2';
import { EmptyLayout } from './shared/layouts/empty-layout/empty-layout';
import { Toast } from 'primeng/toast';
import { UserService } from './services/user.service';

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

  private userService = inject(UserService);


  constructor(
    public router: Router,
    public activatedRoute: ActivatedRoute,
  ) {}


  ngOnInit(): void {
    this.getRouteData();
    this.getCurrentUser();
  }


  private getCurrentUser() {
    this.userService.getCurrentUser().subscribe({
      next: (res) => {
        console.log('current user: ', res)
      },
      error: (err) => {
        console.log('errror: ', err)
      }
    })
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


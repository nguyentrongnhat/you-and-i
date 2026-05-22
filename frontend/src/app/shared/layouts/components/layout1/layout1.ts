import { Component, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ROUTE_PATHS } from '../../../../core/constants/route-paths';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import { PlatformService } from '../../../../services/platform.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-layout1',
  imports: [AvatarModule, TooltipModule, CommonModule],
  templateUrl: './layout1.html',
  styleUrl: './layout1.scss',
})
export class Layout1 implements OnInit {
  
  private readonly router = inject(Router);

  protected ROUTE_PATHS = ROUTE_PATHS;

  protected expandSideMenu = signal<boolean>(false);

  private readonly platformService = inject(PlatformService);

  protected navigationItems = signal(
    [
      {
        name: 'Dashboard',
        icon: 'pi-home',
        url: this.ROUTE_PATHS.HOME,
        active: true
      },
      {
        name: 'Memoria',
        icon: 'pi-heart-fill',
        url: '#',
        active: false
      },
      {
        name: 'Activities',
        icon: 'pi-list-check',
        url: '#',
        active: false
      },
      {
        name: 'Messages',
        icon: 'pi-send',
        url: '#',
        active: false
      },
      {
        name: 'Game',
        icon: 'pi-discord',
        url: this.ROUTE_PATHS.FIND_NUMBER_GAME,
        active: false
      },
      {
        name: 'Users Management',
        icon: 'pi-users',
        url: this.ROUTE_PATHS.USER_MANAGEMENT,
        active: false
      },
    ]
  );

  ngOnInit(): void {
    this.setActiveByUrl(this.router.url);
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      this.setActiveByUrl(event.urlAfterRedirects);
    });
  }

  private setActiveByUrl(url: string) {
    this.navigationItems.update(items =>
      items.map(item => ({
        ...item,
        active: item.url === (url ? url.slice(1) : '')
      }))
    );
  }

  protected navigateTo(url: string): void {
    if(url === '#') url = ROUTE_PATHS.HOME
    this.router.navigateByUrl(url);
  }

  private hideSideMenuTimeout: ReturnType<typeof setTimeout> | undefined = undefined;

  protected toggleSideMenu(): void {
    clearTimeout(this.hideSideMenuTimeout);

    this.expandSideMenu.update(v => !v);

    if (!this.expandSideMenu()) return;

    this.hideSideMenuTimeout = setTimeout(() => {
      if(this.platformService.isSmallMobileDevice()) this.expandSideMenu.set(false);
    }, 3000);
  }
}

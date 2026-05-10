import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTE_PATHS } from '../../../core/constants/route-paths';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-layout1',
  imports: [AvatarModule],
  templateUrl: './layout1.html',
  styleUrl: './layout1.scss',
})
export class Layout1 {
  private readonly router = inject(Router);

  protected ROUTE_PATHS = ROUTE_PATHS;

  protected navigationItems: any[] = [
    {
      name: 'Dashboard',
      icon: 'pi-home',
      url: this.ROUTE_PATHS.HOME
    },
    {
      name: 'Activities',
      icon: 'pi-list-check',
      url: ''
    },
    {
      name: 'Messages',
      icon: 'pi-send',
      url: ''
    },
    {
      name: 'Game',
      icon: 'pi-discord',
      url: this.ROUTE_PATHS.FIND_NUMBER_GAME
    },
  ]

  protected navigateTo(url: string): void {
    this.router.navigateByUrl(url);
  }
}

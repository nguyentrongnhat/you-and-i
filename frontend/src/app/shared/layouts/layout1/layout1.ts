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
  
  protected navigateToDashboard(): void {
    this.router.navigateByUrl(ROUTE_PATHS.HOME);
  }
}

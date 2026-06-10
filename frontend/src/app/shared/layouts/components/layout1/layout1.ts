import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ROUTE_PATHS } from '../../../../core/constants/route-paths';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import { PlatformService } from '../../../../services/platform.service';
import { filter } from 'rxjs';
import { AuthService } from '../../../../features/auth/services/auth.service';

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

    /** Ẩn bottom navigation khi cuộn xuống, hiện lại khi cuộn lên */
    protected hideBottomNav = signal<boolean>(false);

    private lastScrollTop = 0;

    private readonly platformService = inject(PlatformService);

    private readonly authService = inject(AuthService);

    protected navigationItems = signal(
        [
            {
                name: 'Dashboard',
                icon: 'pi-home',
                url: this.ROUTE_PATHS.HOME.fullPath,
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
                url: this.ROUTE_PATHS.GAME.children.FIND_NUMBER_GAME.fullPath,
                active: false
            },
            {
                name: 'Users Management',
                icon: 'pi-users',
                url: this.ROUTE_PATHS.USER.children.MANAGEMENT.fullPath,
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


    @HostListener('window:scroll')
    onContentScroll(): void {
        const current = window.scrollY;

        if (current <= 0) {
            this.hideBottomNav.set(false);
        } else if (current > this.lastScrollTop + 6) {
            this.hideBottomNav.set(true);
        } else if (current < this.lastScrollTop - 6) {
            this.hideBottomNav.set(false);
        }

        this.lastScrollTop = current;
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
        if (url === '#') url = ROUTE_PATHS.HOME.fullPath;
        this.router.navigateByUrl(url);
    }


    private hideSideMenuTimeout: ReturnType<typeof setTimeout> | undefined = undefined;


    protected toggleSideMenu(): void {
        clearTimeout(this.hideSideMenuTimeout);

        this.expandSideMenu.update(v => !v);

        if (!this.expandSideMenu()) return;

        this.hideSideMenuTimeout = setTimeout(() => {
            if (this.platformService.isMediumDevice()) this.expandSideMenu.set(false);
        }, 3000);
    }


    protected signOut(): void {
        this.authService.logout();
    }
}

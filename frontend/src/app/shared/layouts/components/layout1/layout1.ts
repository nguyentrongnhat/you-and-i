import { Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ROUTE_PATHS } from '../../../../core/constants/route-paths';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import { PlatformService } from '../../../../services/platform.service';
import { filter } from 'rxjs';
import { AuthService } from '../../../../features/auth/services/auth.service';
import { ROLE } from '../../../../core/enums';
import { UserService } from '../../../../features/user-management/services/user.service';
import { PopoverModule } from 'primeng/popover';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'app-layout1',
    imports: [AvatarModule, TooltipModule, CommonModule, PopoverModule, MenuModule],
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

    protected userService = inject(UserService);

    protected fullNavigationItems = signal(
        [
            {
                name: 'Dashboard',
                icon: 'pi-home',
                url: this.ROUTE_PATHS.HOME.fullPath,
                active: true,
                requiredRoles: []
            },
            {
                name: 'Memoria',
                icon: 'pi-heart-fill',
                url: '#',
                active: false,
                requiredRoles: []
            },
            {
                name: 'Activities',
                icon: 'pi-list-check',
                url: '#',
                active: false,
                requiredRoles: []
            },
            {
                name: 'Messages',
                icon: 'pi-send',
                url: '#',
                active: false,
                requiredRoles: []
            },
            {
                name: 'Game',
                icon: 'pi-discord',
                url: this.ROUTE_PATHS.GAME.children.FIND_NUMBER_GAME.children.START_SCREEN.fullPath,
                active: false,
                requiredRoles: []
            },
            {
                name: 'Users Management',
                icon: 'pi-users',
                url: this.ROUTE_PATHS.USER.children.MANAGEMENT.fullPath,
                active: false,
                requiredRoles: [ROLE.SUPER_ADMIN]
            },
        ]
    )

    protected accountMenu: MenuItem[] = [
        {
            label: 'Your Profile',
            icon: 'pi pi-user',
            command: () => {
                this.navigateToProfilePage();
            }
        },
        {
            label: 'Sign out',
            icon: 'pi pi-sign-out',
            command: () => {
                this.signOut();
            }
        }
    ];

    protected navigationItems = computed(() =>  {
        const curreentUserRoles = this.userService.userRoles();
        return this.fullNavigationItems().filter(item => item.requiredRoles.every(role => curreentUserRoles.includes(role)));
    })
    

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
        this.fullNavigationItems.update(items =>
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


    private navigateToProfilePage(): void {
        this.router.navigateByUrl(ROUTE_PATHS.USER.children.DETAIL.fullPath.replace(':id', this.userService.currentUser()?.id || ''));
    }
}

import { Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ROUTE_PATHS } from '../../../../core/constants/route-paths';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import { PlatformService } from '../../../../services/platform.service';
import { NavigationService } from '../../../../services/navigation.service';
import { filter } from 'rxjs';
import { AuthService } from '../../../../features/auth/services/auth.service';
import { ROLE } from '../../../../core/enums';
import { UserService } from '../../../../features/user-management/services/user.service';
import { SessionStorageService } from '../../../../services/session-storage.service';

type AppLanguageCode = 'vi' | 'en';

interface AppLanguage {
    code: AppLanguageCode;
    label: string;
    flag: string;
}

const LANGUAGE_STORAGE_KEY = 'jom_app_lang';

@Component({
    selector: 'app-layout1',
    imports: [AvatarModule, TooltipModule, CommonModule],
    templateUrl: './layout1.html',
    styleUrl: './layout1.scss',
})
export class Layout1 implements OnInit {

    private readonly router = inject(Router);

    private readonly navigationService = inject(NavigationService);

    private readonly platformService = inject(PlatformService);

    private readonly authService = inject(AuthService);

    private readonly sessionStorageService = inject(SessionStorageService);

    protected userService = inject(UserService);

    protected ROUTE_PATHS = ROUTE_PATHS;

    protected expandSideMenu = signal<boolean>(false);

    /** Trạng thái mở của hai dropdown trên header */
    protected settingsOpen = signal<boolean>(false);

    protected accountOpen = signal<boolean>(false);

    /** Ẩn bottom navigation khi cuộn xuống, hiện lại khi cuộn lên */
    protected hideBottomNav = signal<boolean>(false);

    private lastScrollTop = 0;

    /** Danh sách ngôn ngữ hỗ trợ */
    protected readonly languages: AppLanguage[] = [
        { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
        { code: 'en', label: 'English', flag: '🇬🇧' },
    ];

    protected currentLanguageCode = signal<AppLanguageCode>('vi');

    /** Thông tin hiển thị của người dùng (dẫn xuất từ UserService) */
    protected displayName = computed<string>(() => {
        const user = this.userService.currentUser();
        return (
            user?.profile?.displayName?.trim() ||
            user?.profile?.fullName?.trim() ||
            user?.username ||
            'Guest'
        );
    });

    protected userHandle = computed<string>(() => {
        const username = this.userService.currentUser()?.username;
        return username ? `@${username}` : '';
    });

    protected avatarUrl = computed<string | undefined>(
        () => this.userService.currentUser()?.profile?.avatarUrl || undefined
    );

    protected userInitials = computed<string>(() => {
        const source = this.displayName();
        return this.userService.extractAvatarFromName(source);
    });

    protected primaryRoleLabel = computed<string>(() => {
        const roles = this.userService.userRoles();
        if (roles.includes(ROLE.SUPER_ADMIN)) return 'Super Admin';
        if (roles.includes(ROLE.ADMIN)) return 'Admin';
        if (roles.includes(ROLE.USER)) return 'Member';
        return 'Member';
    });

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

    protected navigationItems = computed(() =>  {
        const curreentUserRoles = this.userService.userRoles();
        return this.fullNavigationItems().filter(item => item.requiredRoles.every(role => curreentUserRoles.includes(role)));
    })
    

    ngOnInit(): void {
        this.restoreLanguage();
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
        this.navigationService.navigate(url);
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


    protected setLanguage(code: AppLanguageCode): void {
        this.currentLanguageCode.set(code);
        this.sessionStorageService.setItem(LANGUAGE_STORAGE_KEY, code);
    }
    private restoreLanguage(): void {
        const saved = this.sessionStorageService.getItem(LANGUAGE_STORAGE_KEY) as AppLanguageCode | null;
        if (saved && this.languages.some(l => l.code === saved)) {
            this.currentLanguageCode.set(saved);
        }
    }


    protected signOut(): void {
        this.authService.logout();
    }

    /** ===== Dropdown menus ===== */
    @HostListener('document:keydown.escape')
    protected onEscape(): void {
        this.closeMenus();
    }

    protected toggleSettings(): void {
        this.accountOpen.set(false);
        this.settingsOpen.update(v => !v);
    }

    protected toggleAccount(): void {
        this.settingsOpen.set(false);
        this.accountOpen.update(v => !v);
    }

    protected openSettingsFromAccount(): void {
        this.accountOpen.set(false);
        this.settingsOpen.set(true);
    }

    protected closeMenus(): void {
        this.settingsOpen.set(false);
        this.accountOpen.set(false);
    }


    protected navigateToProfilePage(): void {
        this.navigationService.goToUserDetail(this.userService.currentUser()?.id || '');
    }
}

import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TagModule } from 'primeng/tag';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { UserDetails } from '../../../../core/interfaces/user.dtos';
import { Page } from '../../../../core/interfaces/request.dtos';
import { ROLE } from '../../../../core/enums';
import { PlatformService } from '../../../../services/platform.service';
import { NavigationService } from '../../../../services/navigation.service';
import { UserService } from '../../services/user.service';
import { LoaderService } from '../../../../services/loader.service';
import { UserStats } from '../../components/user-stats/user-stats';
import { UserFilters } from '../../components/user-filters/user-filters';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';
type RoleFilter = 'ALL' | ROLE;

interface FilterChip<T> {
	label: string;
	value: T;
	icon?: string;
}

@Component({
	selector: 'app-user-management',
	imports: [
		ToggleSwitchModule,
		FormsModule,
		AvatarModule,
		ButtonModule,
		PaginatorModule,
		TagModule,
		UserStats,
		UserFilters,
	],
	templateUrl: './user-management.html',
	styleUrl: './user-management.scss',
})
export class UserManagement {
	private readonly userService = inject(UserService);

	protected platformService = inject(PlatformService);

	private readonly navigationService = inject(NavigationService);

	protected readonly users = signal<UserDetails[]>([]);

	protected loaderService = inject(LoaderService);

	protected readonly searchTerm = signal<string>('');

	protected readonly statusFilter = signal<StatusFilter>('ALL');

	protected readonly roleFilter = signal<RoleFilter>('ALL');

	private destroyRef = inject(DestroyRef);

	protected readonly statusChips: FilterChip<StatusFilter>[] = [
		{ label: 'Tất cả', value: 'ALL' },
		{ label: 'Đang hoạt động', value: 'ACTIVE', icon: 'pi pi-check-circle' },
		{ label: 'Đã khóa', value: 'INACTIVE', icon: 'pi pi-ban' },
	];

	protected readonly roleChips: FilterChip<RoleFilter>[] = [
		{ label: 'Tất cả vai trò', value: 'ALL' },
		{ label: 'Super Admin', value: ROLE.SUPER_ADMIN },
		{ label: 'Admin', value: ROLE.ADMIN },
		{ label: 'User', value: ROLE.USER },
		{ label: 'Guest', value: ROLE.GUEST },
	];

	protected readonly filteredUsers = computed<UserDetails[]>(() => {
		const term = this.searchTerm().trim().toLowerCase();
		const status = this.statusFilter();
		const role = this.roleFilter();

		return this.users().filter((user) => {
			// Search
			if (term) {
				const fullName = user.profile?.fullName ?? '';
				const displayName = user.profile?.displayName ?? '';
				const matchesTerm =
					user.username.toLowerCase().includes(term) ||
					fullName.toLowerCase().includes(term) ||
					displayName.toLowerCase().includes(term);
				if (!matchesTerm) return false;
			}

			// Status
			if (status === 'ACTIVE' && !user.enabled) return false;
			if (status === 'INACTIVE' && user.enabled) return false;

			// Role
			if (role !== 'ALL' && !(user.roles ?? []).includes(role)) return false;

			return true;
		});
	});

	protected readonly enabledCount = computed<number>(
		() => this.users().filter((user) => user.enabled).length
	);

	protected readonly disabledCount = computed<number>(
		() => this.users().filter((user) => !user.enabled).length
	);

	protected readonly verifiedCount = computed<number>(
		() => this.users().filter((user) => user.emailVerified).length
	);

	protected readonly adminCount = computed<number>(
		() =>
			this.users().filter((user) =>
				(user.roles ?? []).some(
					(role) => role === ROLE.ADMIN || role === ROLE.SUPER_ADMIN
				)
			).length
	);

	protected readonly hasActiveFilters = computed<boolean>(
		() =>
			this.searchTerm().trim().length > 0 ||
			this.statusFilter() !== 'ALL' ||
			this.roleFilter() !== 'ALL'
	);

	// ── Pagination ──────────────────────────────────────────────────────────────
	protected readonly first = signal<number>(0);
	protected readonly rows = signal<number>(10);
	protected readonly rowsPerPageOptions = [10, 20, 50];

	protected readonly pagedUsers = computed<UserDetails[]>(() => {
		const start = this.first();
		return this.filteredUsers().slice(start, start + this.rows());
	});

	protected onPageChange(event: PaginatorState): void {
		this.first.set(event.first ?? 0);
		this.rows.set(event.rows ?? this.rows());
	}

	private resetPage(): void {
		this.first.set(0);
	}

	constructor() {
		this.getAllUsers();
	}

	private getAllUsers(): void {
		this.loaderService.show();
		this.userService.getAllUsers()
		.pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loaderService.hide()))
		.subscribe({
			next: (res: Page<UserDetails>) => {
				console.log('response from getAllUsers:', res);
				this.users.set(res.content);
			},
			error: (err) => {
				console.log('Error fetching users:', err);
			},
		});
	}

	protected onSearch(value: string): void {
		this.searchTerm.set(value);
		this.resetPage();
	}

	protected setStatusFilter(value: string): void {
		this.statusFilter.set(value as StatusFilter);
		this.resetPage();
	}

	protected setRoleFilter(value: string): void {
		this.roleFilter.set(value as RoleFilter);
		this.resetPage();
	}

	protected clearFilters(): void {
		this.searchTerm.set('');
		this.statusFilter.set('ALL');
		this.roleFilter.set('ALL');
		this.resetPage();
	}

	protected roleLabel(role: string): string {
		switch (role) {
			case ROLE.SUPER_ADMIN:
				return 'Super Admin';
			case ROLE.ADMIN:
				return 'Admin';
			case ROLE.USER:
				return 'User';
			case ROLE.GUEST:
				return 'Guest';
			default:
				return role.replace(/^ROLE_/, '');
		}
	}

	protected roleSeverity(
		role: string
	): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
		switch (role) {
			case ROLE.SUPER_ADMIN:
				return 'danger';
			case ROLE.ADMIN:
				return 'warn';
			case ROLE.USER:
				return 'info';
			default:
				return 'secondary';
		}
	}

	protected initials(user: UserDetails): string {
		const source =
			user.profile?.fullName ||
			user.profile?.displayName ||
			user.username ||
			'';
		return this.userService.extractAvatarFromName(source);
	}

	protected displayName(user: UserDetails): string {
		return user.profile?.fullName || user.profile?.displayName || user.username;
	}

	protected toggleActiveUserAccount(user: UserDetails): void {
		this.userService.updateUserData(user)
		.pipe(takeUntilDestroyed(this.destroyRef))
		.subscribe({
			next: () => { },
			error: () => {
				user.enabled = !user.enabled;
			},
		});
	}

	protected navigateToUserDetail(user: UserDetails): void {
		this.navigationService.goToUserDetail(user.id);
	}
}

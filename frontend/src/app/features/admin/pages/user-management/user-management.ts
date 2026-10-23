import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

import { UserDetails } from '../../../../core/interfaces/user.dtos';
import { MESSAGE_TYPE } from '../../../../core/enums';
import { NavigationService } from '../../../../services/navigation.service';
import { ToastService } from '../../../../services/toast.service';
import { UserService } from '../../services/user.service';

type StatusFilter = 'all' | 'active' | 'disabled';

interface StatusFilterOption {
  value: StatusFilter;
  label: string;
  count: number;
}

@Component({
  selector: 'app-user-management',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    AvatarModule,
    ButtonModule,
    InputTextModule,
    PaginatorModule,
    SkeletonModule,
    TagModule,
    ToggleSwitchModule,
  ],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss',
})
export class UserManagement {
  private readonly userService = inject(UserService);

  private readonly navigationService = inject(NavigationService);

  private readonly toastService = inject(ToastService);

  private readonly destroyRef = inject(DestroyRef);

  private readonly listTop = viewChild<ElementRef<HTMLElement>>('listTop');

  protected readonly users = signal<UserDetails[]>([]);

  /**
   * Starts as true so the server and the first browser render both show the
   * skeleton. Data is fetched in the browser only (see constructor), so the
   * server HTML and the hydrated HTML are always identical.
   */
  protected readonly isLoading = signal(true);

  protected readonly loadError = signal(false);

  protected readonly searchTerm = signal<string>('');

  protected readonly statusFilter = signal<StatusFilter>('all');

  protected readonly first = signal(0);

  protected readonly rows = signal(10);

  /** Ids of users whose enabled state is being saved. */
  protected readonly pendingIds = signal<ReadonlySet<UserDetails['id']>>(
    new Set(),
  );

  protected readonly skeletonRows = [0, 1, 2, 3, 4, 5];

  protected readonly counts = computed(() => {
    const list = this.users();
    const active = list.filter((user) => user.enabled).length;

    return {
      all: list.length,
      active,
      disabled: list.length - active,
    };
  });

  protected readonly enabledCount = computed<number>(
    () => this.counts().active,
  );

  protected readonly activeRatio = computed<number>(() => {
    const { all, active } = this.counts();
    return all === 0 ? 0 : Math.round((active / all) * 100);
  });

  protected readonly filterOptions = computed<StatusFilterOption[]>(() => {
    const counts = this.counts();

    return [
      { value: 'all', label: 'Tất cả', count: counts.all },
      { value: 'active', label: 'Hoạt động', count: counts.active },
      { value: 'disabled', label: 'Đã tắt', count: counts.disabled },
    ];
  });

  protected readonly filteredUsers = computed<UserDetails[]>(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.users().filter((user) => {
      if (status === 'active' && !user.enabled) return false;
      if (status === 'disabled' && user.enabled) return false;
      if (!term) return true;

      const fullName = user.profile?.fullName ?? '';
      const displayName = user.profile?.displayName ?? '';

      return (
        user.username.toLowerCase().includes(term) ||
        fullName.toLowerCase().includes(term) ||
        displayName.toLowerCase().includes(term)
      );
    });
  });

  protected readonly hasActiveFilters = computed(
    () => this.searchTerm().trim() !== '' || this.statusFilter() !== 'all',
  );

  /** Keeps the page valid when the list shrinks (filter, toggle). */
  protected readonly currentFirst = computed(() => {
    const total = this.filteredUsers().length;
    const rows = this.rows();
    const lastPageStart = Math.max(0, Math.ceil(total / rows) - 1) * rows;

    return Math.min(this.first(), lastPageStart);
  });

  protected readonly pagedUsers = computed<UserDetails[]>(() => {
    const start = this.currentFirst();
    return this.filteredUsers().slice(start, start + this.rows());
  });

  constructor() {
    // Browser only: never runs on the server.
    afterNextRender(() => this.loadUsers());
  }

  protected loadUsers(): void {
    this.isLoading.set(true);
    this.loadError.set(false);

    this.userService
      .getAllUsers()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (res: UserDetails[]) => {
          this.users.set(res);
        },
        error: (err) => {
          console.error('Error fetching users:', err);
          this.loadError.set(true);
        },
      });
  }

  protected onSearch(value: string): void {
    this.searchTerm.set(value ?? '');
    this.first.set(0);
  }

  protected setStatusFilter(value: StatusFilter): void {
    this.statusFilter.set(value);
    this.first.set(0);
  }

  protected clearFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('all');
    this.first.set(0);
  }

  protected onPageChange(event: PaginatorState): void {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? this.rows());
    this.scrollToListTop();
  }

  private scrollToListTop(): void {
    // Called from an event handler, so this only runs in the browser.
    const element = this.listTop()?.nativeElement;

    if (!element) return;

    const reduceMotion = element.ownerDocument.defaultView?.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    element.scrollIntoView({
      block: 'start',
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }

  protected initials(user: UserDetails): string {
    const source =
      user.profile?.fullName ||
      user.profile?.displayName ||
      user.username ||
      '';
    const parts = source.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  protected displayName(user: UserDetails): string {
    return user.profile?.fullName || user.profile?.displayName || user.username;
  }

  /** Stable hue (0-359) from the name, identical on server and browser. */
  protected avatarHue(user: UserDetails): number {
    const name = this.displayName(user);
    let hash = 0;

    for (let index = 0; index < name.length; index++) {
      hash = (hash * 31 + name.charCodeAt(index)) % 360;
    }

    return hash;
  }

  protected isPending(user: UserDetails): boolean {
    return this.pendingIds().has(user.id);
  }

  /**
   * Optimistic update with immutable state: the list, the counters and the
   * filters react at once. On failure the change is reverted and the user is told.
   */
  protected toggleActiveUserAccount(user: UserDetails, enabled: boolean): void {
    if (this.isPending(user)) return;

    this.setPending(user.id, true);
    this.patchUser(user.id, { enabled });

    this.userService
      .updateUserData({ ...user, enabled })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.setPending(user.id, false)),
      )
      .subscribe({
        error: () => {
          this.patchUser(user.id, { enabled: !enabled });
          this.toastService.showToast(
            MESSAGE_TYPE.ERROR,
            'Cập nhật thất bại',
            'Không thể thay đổi trạng thái tài khoản.',
          );
        },
      });
  }

  protected navigateToUserDetail(user: UserDetails): void {
    this.navigationService.goToUserDetail(user.id);
  }

  private patchUser(id: UserDetails['id'], changes: Partial<UserDetails>): void {
    this.users.update((list) =>
      list.map((user) => (user.id === id ? { ...user, ...changes } : user)),
    );
  }

  private setPending(id: UserDetails['id'], pending: boolean): void {
    this.pendingIds.update((current) => {
      const next = new Set(current);

      if (pending) {
        next.add(id);
      } else {
        next.delete(id);
      }

      return next;
    });
  }
}
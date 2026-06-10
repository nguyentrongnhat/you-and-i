import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ROUTE_PATHS } from '../../../../core/constants/route-paths';
import { UserDetails } from '../../../../core/interfaces/user.dtos';
import { PlatformService } from '../../../../services/platform.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-management',
  imports: [
    TableModule,
    ToggleSwitchModule,
    FormsModule,
    AvatarModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    TagModule,
  ],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss',
})
export class UserManagement {
  private readonly userService = inject(UserService);

  protected platformService = inject(PlatformService);

  private readonly router = inject(Router);

  protected readonly users = signal<UserDetails[]>([]);
  protected readonly loading = signal<boolean>(true);
  protected readonly searchTerm = signal<string>('');

  protected readonly filteredUsers = computed<UserDetails[]>(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.users();
    if (!term) return list;
    return list.filter((user) => {
      const fullName = user.profile?.fullName ?? '';
      const displayName = user.profile?.displayName ?? '';
      return (
        user.username.toLowerCase().includes(term) ||
        fullName.toLowerCase().includes(term) ||
        displayName.toLowerCase().includes(term)
      );
    });
  });

  protected readonly enabledCount = computed<number>(
    () => this.users().filter((user) => user.enabled).length
  );

  constructor() {
    this.getAllUsers();
  }

  private getAllUsers(): void {
    this.loading.set(true);
    this.userService.getAllUsers().subscribe({
      next: (res: UserDetails[]) => {
        this.users.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  protected onSearch(value: string): void {
    this.searchTerm.set(value);
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

  protected toggleActiveUserAccount(user: UserDetails): void {
    this.userService.updateUserData(user).subscribe({
      next: () => {},
      error: () => {
        user.enabled = !user.enabled;
      },
    });
  }

  protected navigateToUserDetail(user: UserDetails): void {
    this.router.navigateByUrl(
      ROUTE_PATHS.USER.children.DETAIL.fullPath.replace(':id', user.id)
    );
  }
}

import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ROUTE_PATHS } from '../../../../core/constants/route-paths';
import { UserDetails } from '../../../../core/interfaces/user.dtos';
import { PlatformService } from '../../../../services/platform.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-management',
  imports: [TableModule, ToggleSwitchModule, FormsModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss',
})
export class UserManagement {
  private readonly userService = inject(UserService);

  protected users = signal<UserDetails[]>([]);

  protected platformService = inject(PlatformService);

  private readonly router = inject(Router);

  constructor() {
    this.getAllUsers();
  }

  
  private getAllUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (res: UserDetails[]) => {
        console.log(res);
        this.users.set(res);
      },
      error: (err) => {
        console.log(err);
      }
    })
  };


  protected toggleActiveUserAccount(user: UserDetails) {
    console.log('toggle user account', user);
    this.userService.updateUserData(user).subscribe({
      next: (res) => {
        console.log('User data updated successfully:', res);
      },
      error: (err) => {
        console.log('Error updating user data:', err);
        user.enabled = !user.enabled;
      }
    })
  }


  protected navigateToUserDetail(user: UserDetails) {
    this.router.navigateByUrl(ROUTE_PATHS.USER.children.DETAIL.fullPath.replace(':id', user.id));
  }

}

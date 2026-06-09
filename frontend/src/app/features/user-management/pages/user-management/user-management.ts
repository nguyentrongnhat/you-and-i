import { Component, inject, signal } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { PlatformService } from '../../../../services/platform.service';
import { UserService } from '../../services/user.service';
import { UserDetail } from '../user-detail/user-detail';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { HttpClientService } from '../../../../services/http-client.service';
import { UserDetails } from '../../../../core/interfaces/user.dtos';

@Component({
  selector: 'app-user-management',
  imports: [TableModule, ToggleSwitchModule, FormsModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss',
  providers: [DialogService]
})
export class UserManagement {
  private readonly userService = inject(UserService);

  protected users = signal<UserDetails[]>([]);

  protected platformService = inject(PlatformService);

  private readonly dialogService = inject(DialogService);

  private userDetailRef: DynamicDialogRef | null = null;

  constructor() {
    this.userService.getAllUsers().subscribe({
      next: (res: UserDetails[]) => {
        console.log(res);
        this.users.set(res);
      },
      error: (err) => {
        console.log(err);
      }
    })
  }


  displayUserDetailDialog() {
    this.userDetailRef = this.dialogService.open(UserDetail, {
        header: 'Select a Product',
        width: '50vw',
        modal: true,
        closable: true,
        breakpoints: {
            '960px': '75vw',
            '640px': '90vw'
        },
    });
  }


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
}

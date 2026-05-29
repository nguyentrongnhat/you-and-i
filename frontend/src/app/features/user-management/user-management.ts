import { Component, inject, signal } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { PlatformService } from '../../services/platform.service';
import { UserService } from '../../services/user.service';
import { UserDetail } from './components/user-detail/user-detail';

@Component({
  selector: 'app-user-management',
  imports: [TableModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss',
  providers: [DialogService]
})
export class UserManagement {
  private readonly userService = inject(UserService);

  protected users = signal<any[]>([]);

  protected platformService = inject(PlatformService);

  private readonly dialogService = inject(DialogService);

  userDetailRef: DynamicDialogRef | null = null;

  constructor() {
    this.userService.getAllUsers().subscribe({
      next: (res: any) => {
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
}

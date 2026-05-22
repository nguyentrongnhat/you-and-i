import { Component, inject, signal } from '@angular/core';
import { UserService } from '../../services/user.service';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-user-management',
  imports: [TableModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss',
})
export class UserManagement {
  private readonly userService = inject(UserService);

  protected users = signal<any[]>([]);

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
}

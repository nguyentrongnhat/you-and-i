import { Component, inject, Type } from '@angular/core';
import { OnInit } from '@angular/core';
import { LoaderService } from '../../../../services/loader.service';
import { PlatformService } from '../../../../services/platform.service';
import { TabsModule } from 'primeng/tabs';
import { CommonModule } from '@angular/common';
import { UserManagement } from '../user-management/user-management';
import { RelationshipManagement } from '../relationship-management/relationship-management';

interface ManagementTab {
  title: string;
  value: number;
  component: Type<unknown>;
}

@Component({
  selector: 'app-management',
  imports: [TabsModule, CommonModule],
  templateUrl: './management.html',
  styleUrl: './management.scss',
})
export class Management implements OnInit {

  private loaderService = inject(LoaderService);

  private platformService = inject(PlatformService);

  tabs: ManagementTab[] = [
    {
      title: 'Users',
      value: 0,
      component: UserManagement,
    },
    {
      title: 'Relationships',
      value: 1,
      component: RelationshipManagement,
    },
  ];


  ngOnInit(): void {
    console.log('Management component initialized');
    if(this.platformService.isBrowser()) {
      this.loaderService.hide();
    }
  }
}

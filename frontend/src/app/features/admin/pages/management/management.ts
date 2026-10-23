import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  Type,
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

import { LoaderService } from '../../../../services/loader.service';
import { PlatformService } from '../../../../services/platform.service';
import { UserManagement } from '../user-management/user-management';
import { RelationshipManagement } from '../relationship-management/relationship-management';

interface ManagementTab {
  title: string;
  value: number;
  /** Value used in the URL, for example ?tab=relationships */
  slug: string;
  icon: string;
  description: string;
  component: Type<unknown>;
}

@Component({
  selector: 'app-management',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TabsModule, NgComponentOutlet],
  templateUrl: './management.html',
  styleUrl: './management.scss',
})
export class Management implements OnInit {
  private loaderService = inject(LoaderService);

  private platformService = inject(PlatformService);

  private router = inject(Router);

  private route = inject(ActivatedRoute);

  readonly tabs: readonly ManagementTab[] = [
    {
      title: 'Users',
      value: 0,
      slug: 'users',
      icon: 'pi pi-user',
      description: 'Accounts in the system.',
      component: UserManagement,
    },
    {
      title: 'Relationships',
      value: 1,
      slug: 'relationships',
      icon: 'pi pi-heart',
      description: 'Links between users.',
      component: RelationshipManagement,
    },
  ];

  /**
   * The URL is the single source of truth for the active tab.
   * queryParamMap is available on the server too, so SSR renders the right
   * tab and hydration stays consistent.
   */
  private readonly queryParams = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  protected readonly activeTab = computed(
    () =>
      this.tabs.find((tab) => tab.slug === this.queryParams().get('tab'))
        ?.value ?? this.tabs[0].value,
  );

  protected readonly activeTabConfig = computed(
    () =>
      this.tabs.find((tab) => tab.value === this.activeTab()) ??
      this.tabs[0],
  );

  /**
   * Each tab change adds a history entry, so the browser back button
   * returns to the previous tab.
   */
  protected onTabChange(value: string | number | undefined): void {
    const tab = this.tabs.find((item) => item.value === Number(value));

    if (!tab || tab.value === this.activeTab()) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab.slug },
      queryParamsHandling: 'merge',
    });
  }

  ngOnInit(): void {
    if (this.platformService.isBrowser()) {
      this.loaderService.hide();
    }
  }
}
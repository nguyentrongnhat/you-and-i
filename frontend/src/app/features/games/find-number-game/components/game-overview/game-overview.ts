import { Component, computed, inject, signal } from '@angular/core';

import { ROLE } from '../../../../../core/enums';
import { UserService } from '../../../../user-management/services/user.service';
import { GameHistories } from '../game-histories/game-histories';
import { GameRanking } from '../game-ranking/game-ranking';

type OverviewTab = 'history' | 'ranking';

@Component({
	selector: 'app-game-overview',
	imports: [GameHistories, GameRanking],
	templateUrl: './game-overview.html',
	styleUrl: './game-overview.scss',
})
export class GameOverview {
	private readonly userService = inject(UserService);

	protected readonly activeTab = signal<OverviewTab>('history');

	/** Chỉ admin / super admin mới xem được bảng xếp hạng toàn hệ thống */
	protected readonly canViewRanking = computed<boolean>(() =>
		this.userService.hasRoles([ROLE.ADMIN, ROLE.SUPER_ADMIN], 'OR')
	);

	protected setTab(tab: OverviewTab): void {
		this.activeTab.set(tab);
	}
}

import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { TagModule } from 'primeng/tag';
import { FindNumberGameService } from '../../services/findnumber.service';
import { FindNumberGameHistoryItem } from '../../../../../core/interfaces/find-number-game.dto';

@Component({
	selector: 'app-game-histories',
	imports: [DatePipe, TagModule],
	templateUrl: './game-histories.html',
	styleUrl: './game-histories.scss',
})
export class GameHistories {

	protected readonly findNumberGameService = inject(FindNumberGameService);

	protected readonly gameHistories = computed(() => this.findNumberGameService.gameHistories());


	protected readonly history = computed<FindNumberGameHistoryItem[]>(() => this.gameHistories().history.sort((a, b) => b.endTime.localeCompare(a.endTime)));

	/** Thời gian tốt nhất (giây) để đánh dấu kỷ lục */
	protected bestTime = computed<number | null>(() => {
		const histories = this.gameHistories();
		return histories.bestRecord.completionTime || null;
	});

	/** Tổng số ván đã hoàn thành (display-only) */
	protected readonly totalGames = computed<number>(() => this.history().length);

	/** Thời gian trung bình các ván (giây, display-only) */
	protected readonly averageTime = computed<number | null>(() => {
		const items = this.history();
		if (!items.length) return null;
		const total = items.reduce((sum, item) => sum + (item.completionTime || 0), 0);
		return Math.round(total / items.length);
	});

	/** Chuỗi hiển thị kỷ lục */
	protected readonly bestTimeDisplay = computed<string>(() => {
		const best = this.bestTime();
		return best === null ? '--' : this.findNumberGameService.convertTimerToTimeDisplay(best);
	});

	/** Chuỗi hiển thị thời gian trung bình */
	protected readonly averageTimeDisplay = computed<string>(() => {
		const avg = this.averageTime();
		return avg === null ? '--' : this.findNumberGameService.convertTimerToTimeDisplay(avg);
	});

}

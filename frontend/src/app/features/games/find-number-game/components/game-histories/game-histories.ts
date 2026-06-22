import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { FindNumberGameService } from '../../services/findnumber.service';
import { FindNumberGameHistoryItem } from '../../../../../core/interfaces/find-number-game.dto';

@Component({
	selector: 'app-game-histories',
	imports: [DatePipe, TableModule, TagModule],
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

}

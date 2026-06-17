import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { FindNumberGameService } from '../../services/findnumber.service';

@Component({
	selector: 'app-game-histories',
	imports: [DatePipe, TableModule, TagModule],
	templateUrl: './game-histories.html',
	styleUrl: './game-histories.scss',
})
export class GameHistories {

	protected readonly findNumberGameService = inject(FindNumberGameService);

	protected readonly gameHistories = computed(() => this.findNumberGameService.gameHistories());

	/** Thời gian tốt nhất (giây) để đánh dấu kỷ lục */
	protected bestTime = computed<number | null>(() => {
		const histories = this.gameHistories();
		if (!histories.length) return null;
		return Math.min(...histories.map((h) => h.completionTime));
	});

}

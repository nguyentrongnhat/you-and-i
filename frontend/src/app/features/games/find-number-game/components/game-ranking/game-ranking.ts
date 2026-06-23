import { DatePipe, SlicePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { FindNumberGameService } from '../../services/findnumber.service';

@Component({
  selector: 'app-game-ranking',
  imports: [DatePipe, SlicePipe, TableModule],
  templateUrl: './game-ranking.html',
  styleUrl: './game-ranking.scss',
})
export class GameRanking {
  protected readonly findNumberGameService = inject(FindNumberGameService);

	protected readonly bestRecords = computed(() => this.findNumberGameService.bestRecordsRanking());
}

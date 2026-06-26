import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FindNumberGameBestRecordDTO } from '../../../../../core/interfaces/find-number-game.dto';
import { UserService } from '../../../../user-management/services/user.service';
import { FindNumberGameService } from '../../services/findnumber.service';

@Component({
  selector: 'app-game-ranking',
  imports: [DatePipe],
  templateUrl: './game-ranking.html',
  styleUrl: './game-ranking.scss',
})
export class GameRanking {
  protected readonly findNumberGameService = inject(FindNumberGameService);

  protected readonly bestRecordsRanking = computed<FindNumberGameBestRecordDTO[]>(() => this.findNumberGameService.bestRecordsRanking());

  /** Top 3 reordered for the podium display: [2nd, 1st, 3rd] */
  protected readonly podium = computed(() => {
    const top = this.bestRecordsRanking().slice(0, 3);
    const order = [1, 0, 2];
    return order
      .map((rankIndex) => (top[rankIndex] ? { item: top[rankIndex], rank: rankIndex } : null))
      .filter((entry): entry is { item: FindNumberGameBestRecordDTO; rank: number } => entry !== null);
  });

  /** Remaining records (rank 4+) */
  protected readonly others = computed<FindNumberGameBestRecordDTO[]>(() => this.bestRecordsRanking().slice(3));

  protected userService = inject(UserService);
}

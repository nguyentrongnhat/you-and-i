import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { FindNumberGameBestRecordDTO } from '../../../../../core/interfaces/find-number-game.dto';
import { UserService } from '../../../../user-management/services/user.service';
import { FindNumberGameService } from '../../services/findnumber.service';

@Component({
  selector: 'app-game-ranking',
  imports: [DatePipe, TableModule],
  templateUrl: './game-ranking.html',
  styleUrl: './game-ranking.scss',
})
export class GameRanking {
  protected readonly findNumberGameService = inject(FindNumberGameService);

	protected readonly bestRecordsRanking = computed<FindNumberGameBestRecordDTO[]>(() => this.findNumberGameService.bestRecordsRanking());

  protected userService = inject(UserService);
}

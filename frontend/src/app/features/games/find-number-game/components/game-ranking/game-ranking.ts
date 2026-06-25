import { DatePipe, SlicePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { FindNumberGameService } from '../../services/findnumber.service';
import { FindNumberGameBestRecordDTO } from '../../../../../core/interfaces/find-number-game.dto';
import { UserService } from '../../../../user-management/services/user.service';

@Component({
  selector: 'app-game-ranking',
  imports: [DatePipe, SlicePipe, TableModule],
  templateUrl: './game-ranking.html',
  styleUrl: './game-ranking.scss',
})
export class GameRanking {
  protected readonly findNumberGameService = inject(FindNumberGameService);

	protected readonly bestRecordsRanking = computed<FindNumberGameBestRecordDTO[]>(() => this.findNumberGameService.bestRecordsRanking());

  protected userService = inject(UserService);
}

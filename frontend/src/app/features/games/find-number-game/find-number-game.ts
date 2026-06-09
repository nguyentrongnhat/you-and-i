import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { GameHistories } from './components/game-histories/game-histories';
import { GameTable } from './components/game-table/game-table';
import { FindNumberGameService } from './services/findnumber.service';
import { PlatformService } from '../../../services/platform.service';

export type NumberData = {
  value: number;
  rotate: number;
  tx: number;
  ty: number;
  fontSize: number;
};

export enum FIND_NUMBER_GAME_STATUSES {
  NONE = 'none',
  STARTED = 'started',
  FINISHED = 'finished',
  PAUSED = 'paused'
}

@Component({
  selector: 'app-find-number-game',
  imports: [GameTable, ButtonModule, DialogModule, ProgressBarModule, TagModule, GameHistories],
  templateUrl: './find-number-game.html',
  styleUrl: './find-number-game.scss',
})
export class FindNumberGame implements OnInit {
  protected readonly TOTAL_NUMBERS = 100;

  protected FIND_NUMBER_GAME_STATUSES = FIND_NUMBER_GAME_STATUSES;

  protected gameCurrentStatus = signal<FIND_NUMBER_GAME_STATUSES>(FIND_NUMBER_GAME_STATUSES.NONE);

  protected gameFinished = signal<boolean>(false);

  protected visible = signal<boolean>(false);

  private readonly findNumberGameService = inject(FindNumberGameService);

  private readonly destroyRef = inject(DestroyRef);

	protected timer: number = 0;

	protected timeToDisplay = signal<string>('00 : 00 : 00')

	protected timeInterval!: ReturnType<typeof setInterval>;

	protected currentGameId: number = 0;

  /** Số lượng đã tìm đúng trong ván hiện tại */
  protected progress = signal<number>(0);

  /** Thời gian (giây) của ván vừa hoàn thành */
  protected lastFinishTime = signal<number>(0);

  /** Kỷ lục tốt nhất trước khi vào ván hiện tại */
  private previousBest = signal<number | null>(null);

  /** % tiến độ ván hiện tại */
  protected progressPercent = computed(() =>
    Math.min(100, Math.round((this.progress() / this.TOTAL_NUMBERS) * 100))
  );

  /** Tổng số ván đã chơi */
  protected totalGames = computed(() => this.findNumberGameService.gameHistories().length);

  /** Thời gian tốt nhất (giây) từ lịch sử */
  protected bestTime = computed<number | null>(() => {
    const histories = this.findNumberGameService.gameHistories();
    if (!histories.length) return null;
    return Math.min(...histories.map((h) => h.timeToFinish));
  });

  /** Hiển thị thời gian tốt nhất dạng chuỗi */
  protected bestTimeDisplay = computed(() => {
    const best = this.bestTime();
    return best === null ? '--' : this.findNumberGameService.convertTimerToTimeDisplay(best);
  });

  /** Ván vừa rồi có phá kỷ lục cũ không */
  protected isNewRecord = computed(() => {
    const prev = this.previousBest();
    return prev !== null && this.lastFinishTime() > 0 && this.lastFinishTime() < prev;
  });

  ngOnInit(): void {
    this.getHistories();
  }

  protected showGameHistoriesDialog() {
    this.visible.set(true);
  }


  protected onSelectNumber(num: number) {
    this.progress.set(num);
    if(num === 2) {
      this.finishGame();
    }
  }


  protected startGame() {
    this.findNumberGameService.startGame()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (res: any) => {
        this.currentGameId = res.gameId
        this.previousBest.set(this.bestTime());
        this.lastFinishTime.set(0);
        this.progress.set(0);
        this.gameCurrentStatus.set(FIND_NUMBER_GAME_STATUSES.STARTED);
        this.startTimer()
      },
      error: (err) => {
        console.log(err)
      }
    })
  }


  private startTimer(): void {
    if(this.timeInterval) {
      clearInterval(this.timeInterval);
    }

    this.timeInterval = setInterval(() => {
      this.timer ++;
      this.timeToDisplay.set(this.findNumberGameService.convertTimerToTimeDisplay(this.timer));
    }, 1000)
  }


  private stopTimer() {
    clearInterval(this.timeInterval);
    this.timer = 0;
  }


  protected finishGame(): void {
    this.lastFinishTime.set(this.timer);
    this.gameCurrentStatus.set(FIND_NUMBER_GAME_STATUSES.FINISHED)
    this.findNumberGameService.finishGame(this.currentGameId, this.timer)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (res: any) => {
        this.stopTimer();
        this.getHistories()
      }
    })
  }


  protected getHistories() {
    this.findNumberGameService.getGameHistories()
    .pipe(takeUntilDestroyed(this.destroyRef)).subscribe()
  }
}

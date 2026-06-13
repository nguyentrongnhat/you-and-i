import { AfterViewInit, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { finalize } from 'rxjs';
import { LoaderService } from '../../../services/loader.service';
import { GameHistories } from './components/game-histories/game-histories';
import { GameTable } from './components/game-table/game-table';
import { FindNumberGameService } from './services/findnumber.service';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { SpeedDialModule } from 'primeng/speeddial';
import { BUTTON_STYLE, LAYOUT } from '../../../core/enums';
import { LayoutService } from '../../../shared/layouts/services/layout.service';

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
  imports: [
    GameTable,
    ButtonModule,
    DialogModule,
    ProgressBarModule,
    TagModule,
    GameHistories,
    MenuModule,
    SpeedDialModule
  ],
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

  private readonly loaderService = inject(LoaderService);

  private readonly destroyRef = inject(DestroyRef);

  protected timer: number = 0;

  protected currentSelectedNumber = signal<number>(0);

  protected timeToDisplay = signal<string>('00:00:00')

  protected timeInterval!: ReturnType<typeof setInterval>;

  protected currentGameId: number = 0;

  private readonly BUTTON_STYLE = BUTTON_STYLE;

  /** Thời gian (giây) của ván vừa hoàn thành */
  protected lastFinishTime = signal<number>(0);

  /** Kỷ lục tốt nhất trước khi vào ván hiện tại */
  private previousBest = signal<number | null>(null);

  private readonly layoutService = inject(LayoutService);

  /** Tổng số ván đã chơi */
  protected totalGames = computed(() => this.findNumberGameService.gameHistories().length);

  protected items = signal<any[]>([
    {
      label: 'Pause',
      icon: 'pi pi-pause',
      command: () => this.pauseGame(),
      style: this.BUTTON_STYLE.WARN
    },
    {
      label: 'Exit',
      icon: 'pi pi-sign-out',
      command: () => this.exitGame(),
      style: this.BUTTON_STYLE.DANGER
    }
  ]);


  private pauseGame() {
    console.log('Pausing game...')

    this.gameCurrentStatus.set(FIND_NUMBER_GAME_STATUSES.PAUSED);

    this.stopTimer();
    
    this.items.set([ 
      {
        label: 'Resume',
        icon: 'pi pi-play-circle',
        command: () => this.resumeGame(),
        style: this.BUTTON_STYLE.PRIMARY
      },
      {
        label: 'Exit',
        icon: 'pi pi-sign-out',
        command: () => this.exitGame(),
        style: this.BUTTON_STYLE.DANGER
      }
    ]);
  }


  private resumeGame() {

    this.gameCurrentStatus.set(FIND_NUMBER_GAME_STATUSES.STARTED);

    this.startTimer();
    
    this.items.set([
      {
        label: 'Pause',
        icon: 'pi pi-pause',
        command: () => this.pauseGame(),
        style: this.BUTTON_STYLE.WARN          
      },
      {
        label: 'Exit',
        icon: 'pi pi-sign-out',
        command: () => this.exitGame(),
        style: this.BUTTON_STYLE.DANGER
      }
    ]);
  }


  private exitGame() {
    this.stopTimer();
    this.gameCurrentStatus.set(FIND_NUMBER_GAME_STATUSES.NONE);
    this.layoutService.set(LAYOUT.LAYOUT_1);
  }

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
 
    this.currentSelectedNumber.set(num + 1);
 
    if (num === this.TOTAL_NUMBERS) {
      this.finishGame();
    }
  }


  protected startGame() {
    this.loaderService.show();
    this.findNumberGameService.startGame()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loaderService.hide())
      )
      .subscribe({
        next: (res: any) => {
          this.layoutService.set(LAYOUT.EMPTY_LAYOUT);
          this.currentGameId = res.gameId
          this.previousBest.set(this.bestTime());
          this.lastFinishTime.set(0);
          this.currentSelectedNumber.set(0);
          this.gameCurrentStatus.set(FIND_NUMBER_GAME_STATUSES.STARTED);
          this.timer = 0;
          this.startTimer()
        },
        error: (err) => {
          console.log(err)
        }
      })
  }


  private startTimer(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }

    this.timeInterval = setInterval(() => {
      this.timer++;
      this.timeToDisplay.set(this.findNumberGameService.convertTimerToTimeDisplay(this.timer));
    }, 1000)
  }


  private stopTimer() {
    clearInterval(this.timeInterval);
  }


  protected finishGame(): void {
    this.stopTimer();
    this.layoutService.set(LAYOUT.LAYOUT_1);
    this.loaderService.show();
    this.lastFinishTime.set(this.timer);
    this.gameCurrentStatus.set(FIND_NUMBER_GAME_STATUSES.FINISHED)
    this.findNumberGameService.finishGame(this.currentGameId, this.timer)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loaderService.hide()),
      )
      .subscribe({
        next: (res: any) => {
          this.getHistories()
        },
        error: (err) => {
          console.log(err)
        }
      })
  }


  protected getHistories() {
    this.loaderService.show();
    this.findNumberGameService.getGameHistories()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loaderService.hide())
      ).subscribe()
  }
}

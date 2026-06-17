import { Component, computed, DestroyRef, effect, inject, input, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { ProgressBarModule } from 'primeng/progressbar';
import { SpeedDialModule } from 'primeng/speeddial';
import { TagModule } from 'primeng/tag';
import { finalize } from 'rxjs';
import { ROUTE_PATHS } from '../../../../../core/constants/route-paths';
import { FindNumberGameDTO } from '../../../../../core/interfaces/find-number-game.dto';
import { LoaderService } from '../../../../../services/loader.service';
import { PlatformService } from '../../../../../services/platform.service';
import { GameHistories } from '../../components/game-histories/game-histories';
import { FindNumberGameService } from '../../services/findnumber.service';
import { MESSAGE_TYPE } from '../../../../../core/enums';
import { ToastService } from '../../../../../services/toast.service';

export enum FIND_NUMBER_GAME_STATUSES {
   NONE = 'none',
   STARTED = 'started',
   FINISHED = 'finished',
   PAUSED = 'paused'
}

@Component({
   selector: 'app-game-result-screen',
   imports: [
      ButtonModule,
      DialogModule,
      ProgressBarModule,
      TagModule,
      GameHistories,
      MenuModule,
      SpeedDialModule,
   ],
   templateUrl: './game-result-screen.html',
   styleUrl: './game-result-screen.scss',
})
export class GameResultScreen {
   protected gameId = input<string | undefined>(undefined);

   protected readonly TOTAL_NUMBERS = 3;

   protected visible = signal<boolean>(false);

   private readonly findNumberGameService = inject(FindNumberGameService);

   private readonly loaderService = inject(LoaderService);

   private readonly destroyRef = inject(DestroyRef);

   protected currentSelectedNumber = signal<number>(0);

   protected timeToDisplay = signal<string>('00:00:00')

   protected timeInterval!: ReturnType<typeof setInterval>;

   protected currentGameId: number = 0;

   private readonly toastService = inject(ToastService);

   private router = inject(Router);

   /** Thời gian (giây) của ván vừa hoàn thành */
   protected lastFinishTime = signal<number>(0);

   /** Kỷ lục tốt nhất trước khi vào ván hiện tại */
   private previousBest = signal<number | null>(null);
   /** Tổng số ván đã chơi */
   protected totalGames = computed(() => this.findNumberGameService.gameHistories().length);

   /** Thời gian tốt nhất (giây) từ lịch sử */
   protected bestTime = computed<number | null>(() => {
      const histories = this.findNumberGameService.gameHistories();
      if (!histories.length) return null;
      return Math.min(...histories.map((h) => h.completionTime));
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


   constructor() {
      effect(() => {
         const currentGameId = this.gameId();
         if (!currentGameId) return;
         untracked(() => this.getCurrentGameInfo(currentGameId))
      })
   }

   ngOnInit(): void {
      this.getHistories();
   }


   private getCurrentGameInfo(gameId: string) {
      const currentGameInfo = this.findNumberGameService.currentGameInfo();

      if (currentGameInfo?.id != gameId) {
         this.findNumberGameService.currentGameInfo.set(undefined);
      }

      if (currentGameInfo) {
         this.loaderService.hide();
         this.extractDataToDisplayResult();
      }
      else {
         this.findNumberGameService.getCurrentGameInfoById(gameId).subscribe({
            next: (game: FindNumberGameDTO) => {
               this.loaderService.hide();
               this.extractDataToDisplayResult();
            },
            error: (err) => {
               const toastSummary = 'Can not load game';
               const toastDetail = err.error.message;
               this.toastService.showToast(MESSAGE_TYPE.ERROR, toastSummary, toastDetail);
               this.goToGameStartScreen();
            }
         })
      }
   }


   private goToGameStartScreen() {
      this.router.navigateByUrl(ROUTE_PATHS.GAME.children.FIND_NUMBER_GAME.children.START_SCREEN.fullPath);
   }


   private extractDataToDisplayResult() {
      const gameResult = this.findNumberGameService.currentGameInfo() as FindNumberGameDTO;
      this.timeToDisplay.set(this.findNumberGameService.convertTimerToTimeDisplay(Number(gameResult.completionTime)))
   }


   protected showGameHistoriesDialog() {
      this.visible.set(true);
   }

   protected getHistories() {
      this.findNumberGameService.getGameHistories()
         .pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => this.loaderService.hide())
         ).subscribe()
   }

   protected startGame() {
      this.router.navigateByUrl(ROUTE_PATHS.GAME.children.FIND_NUMBER_GAME.children.START_SCREEN.fullPath);
   }
}

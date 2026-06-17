import { Component, computed, DestroyRef, effect, inject, input, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { debounceTime, finalize, Subject, switchMap, take, tap } from 'rxjs';
import { MenuModule } from 'primeng/menu';
import { SpeedDialModule } from 'primeng/speeddial';
import { BUTTON_STYLE, GAME_DIFFICULTY_LEVEL, GAME_STATUSES, MESSAGE_TYPE } from '../../../../../core/enums';
import { LoaderService } from '../../../../../services/loader.service';
import { GameTable } from '../../components/game-table/game-table';
import { FindNumberGameService } from '../../services/findnumber.service';
import { FindNumberGameDTO } from '../../../../../core/interfaces/find-number-game.dto';
import { Router } from '@angular/router';
import { ROUTE_PATHS } from '../../../../../core/constants/route-paths';
import { subscribe } from 'diagnostics_channel';
import { ToastService } from '../../../../../services/toast.service';
import { AuthService } from '../../../../auth/services/auth.service';

@Component({
   selector: 'app-game-play-screen',
   imports: [
      GameTable,
      ButtonModule,
      DialogModule,
      ProgressBarModule,
      TagModule,
      MenuModule,
      SpeedDialModule
   ],
   templateUrl: './game-play-screen.html',
   styleUrl: './game-play-screen.scss',
})
export class GamePlayScreen {
   protected gameId = input<string | undefined>(undefined);

   protected gameCurrentStatus = signal<GAME_STATUSES>(GAME_STATUSES.NEW);

   protected timer: number = 0;

   protected currentSelectedNumber = computed(() => this.findNumberGameService.currentSeclectedNumber());

   protected timeToDisplay = signal<string>('00:00:00')

   protected timeInterval!: ReturnType<typeof setInterval>;

   protected GAME_STATUSES = GAME_STATUSES;

   protected lastFinishTime = signal<number>(0);

   protected TOTAL_NUMBERS = 3;

   protected currentGameInfo: FindNumberGameDTO | undefined = undefined;

   private findNumberGameService = inject(FindNumberGameService);

   private loaderService = inject(LoaderService);

   private destroyRef = inject(DestroyRef);

   private triggerUpdateGameStatus = new Subject<FindNumberGameDTO>();

   private router = inject(Router);

   private BUTTON_STYLE = BUTTON_STYLE;

   private timerStartPoint: Date | null = null;

   private toastService = inject(ToastService);

   private authService = inject(AuthService);

   protected bestTime = computed<number | null>(() => {
      const histories = this.findNumberGameService.gameHistories();
      if (!histories.length) return null;
      return Math.min(...histories.map((h) => h.completionTime));
   });

   protected bestTimeDisplay = computed(() => {
      const best = this.bestTime();
      return best === null ? '--' : this.findNumberGameService.convertTimerToTimeDisplay(best);
   });

   protected totalGames = computed(() => this.findNumberGameService.gameHistories().length);

   protected actionItems = computed<any[]>(() => {
      const paused = {
         label: 'Pause',
         icon: 'pi pi-pause',
         command: () => this.pauseGame(),
         style: this.BUTTON_STYLE.WARN
      }
      
      const resume = {
         label: 'Resume',
         icon: 'pi pi-play-circle',
         command: () => this.resumeFromPause(),
         style: this.BUTTON_STYLE.PRIMARY
      }
      
      const shuffle = {
         label: 'Shuffle',
         icon: 'pi pi-sync',
         command: () => this.findNumberGameService.shuffleNumbers.next(true),
         style: this.BUTTON_STYLE.SUCCESS
      }

      const exit = {
         label: 'Exit',
         icon: 'pi pi-sign-out',
         command: () => this.exitGame(),
         style: this.BUTTON_STYLE.DANGER
      }
      
      const gameStatus = this.gameCurrentStatus();

      if (gameStatus === GAME_STATUSES.PAUSED) {
         return [resume, exit];
      }
      return [paused, shuffle, exit];
   });


   constructor() {
      effect(() => {
         const currentGameId = this.gameId();
         if (!currentGameId) return;
         untracked(() => this.getCurrentGameInfo(currentGameId));
      }),


      effect(() => {
         const currentSelectedNumber = this.currentSelectedNumber();

         if (currentSelectedNumber === (this.currentGameInfo?.lastSelectedNumber || 0)) return;
         
         this.updateGameStatusAfterSeclectEachNumber(currentSelectedNumber, this.timer)
         if (this.findNumberGameService.currentSeclectedNumber() === this.TOTAL_NUMBERS) {
            this.finishGame();
         }
      })
   }


   ngOnInit(): void {
      this.getHistories();
      this.updateGameStatus();
   }


   private getCurrentGameInfo(gameId: string) {
      const gameInfoFromService = this.findNumberGameService.currentGameInfo();
      if (gameInfoFromService?.id != gameId) {
         this.findNumberGameService.currentGameInfo.set(undefined);
      }

      if (gameInfoFromService) {
         this.loaderService.hide();
         this.currentGameInfo = {...this.findNumberGameService.currentGameInfo() as FindNumberGameDTO}
         this.loadGameStates();
         return;
      }
      
      this.findNumberGameService.getCurrentGameInfoById(gameId).pipe(
         takeUntilDestroyed(this.destroyRef),
         finalize(() => this.loaderService.hide())
      ).subscribe({
         next: (game: FindNumberGameDTO) => {
            this.currentGameInfo = {...this.findNumberGameService.currentGameInfo() as FindNumberGameDTO}
            this.loadGameStates();
         },
         error: err => {
            const toastSummary = 'Can not load game';
            const toastDetail = err.error.message;
            this.toastService.showToast(MESSAGE_TYPE.ERROR, toastSummary, toastDetail);
            this.exitGame();
         }
      });
   }


   private loadGameStates() {
      const gameStatus = this.currentGameInfo?.gameStatus;
      switch (gameStatus) {
         case GAME_STATUSES.NEW:
            this.startNewGame();
            break;
         case GAME_STATUSES.PLAYING:
            this.loadGameFromLastUpdateInDB();
            break;
         case GAME_STATUSES.PAUSED:
            this.loadPausedGame();
            break;
         case GAME_STATUSES.DONE:
            this.exitGame();
            break;
      }
   }


   private startNewGame() {
      this.currentGameInfo!.gameStatus = GAME_STATUSES.PLAYING
      this.currentGameInfo!.startTime = new Date();
      this.currentGameInfo!.totalNumbersToFind = this.TOTAL_NUMBERS;
      this.currentGameInfo!.lastSelectedNumber = 0;
      this.currentGameInfo!.difficultyLevel = GAME_DIFFICULTY_LEVEL.NORMAL;

      this.findNumberGameService.updateGameInfo(this.currentGameInfo!).subscribe();
      this.gameCurrentStatus.set(GAME_STATUSES.PLAYING);
      this.startTimer();
   }


   private loadGameFromLastUpdateInDB() {
      if (this.currentGameInfo!.lastSelectedNumber === this.TOTAL_NUMBERS) {
         this.timer = Number(this.currentGameInfo!.elapsedTime || 0);
         this.finishGame();
         return;
      }
      this.gameCurrentStatus.set(GAME_STATUSES.PLAYING);
      this.findNumberGameService.currentSeclectedNumber.set(this.currentGameInfo!.lastSelectedNumber || 0);

      this.startTimer(new Date(this.currentGameInfo!.updateAt));
   }


   private resumeFromPause() {
      this.gameCurrentStatus.set(GAME_STATUSES.PLAYING);
      this.findNumberGameService.currentSeclectedNumber.set(this.currentGameInfo!.lastSelectedNumber);
      this.currentGameInfo!.gameStatus = GAME_STATUSES.PLAYING
      this.startTimer();
      this.findNumberGameService.updateGameInfo(this.currentGameInfo!).subscribe();
   }


   private loadPausedGame() {
      this.stopTimer();
      this.gameCurrentStatus.set(GAME_STATUSES.PAUSED);

      this.findNumberGameService.currentSeclectedNumber.set(this.currentGameInfo!.lastSelectedNumber ?? 0);
      this.timeToDisplay.set(this.findNumberGameService.convertTimerToTimeDisplay(Number(this.currentGameInfo!.elapsedTime) ?? 0));
   }


   private pauseGame() {
      this.stopTimer();
      this.gameCurrentStatus.set(GAME_STATUSES.PAUSED);
      this.currentGameInfo!.gameStatus = GAME_STATUSES.PAUSED;
      this.currentGameInfo!.elapsedTime = this.timer;
      this.findNumberGameService.updateGameInfo(this.currentGameInfo!).subscribe();
   }


   protected finishGame(): void {
      this.stopTimer();
      this.loaderService.show();
      this.lastFinishTime.set(this.timer);
      this.findNumberGameService.finishGame(this.gameId()!, this.timer)
         .pipe(takeUntilDestroyed(this.destroyRef))
         .subscribe({
            next: (game: FindNumberGameDTO) => {
               this.findNumberGameService.currentGameInfo.set(game);
               this.goToResultScreen();
            },
            error: (err) => {
               if(err.error.status === 404) {
                  const toastSummary = 'The game is not exist anymore';
                  const toastDetail = 'Please start a new game.';
                  this.toastService.showToast(MESSAGE_TYPE.ERROR, toastSummary, toastDetail);
                  this.exitGame();
                  return;
               }
               else if(err.error.status === 401 || err.error.status === 403) {
                  this.currentGameInfo!.gameStatus = GAME_STATUSES.PLAYING;
                  this.currentGameInfo!.lastSelectedNumber = this.TOTAL_NUMBERS;
                  this.currentGameInfo!.completionTime = this.timer;
                  this.findNumberGameService.currentGameInfo.set(this.currentGameInfo);
                  this.authService.refreshToken();
               }
               else {
                  this.goToResultScreen();
               }
            }
         })
   }


   private exitGame() {
      this.stopTimer();
      this.router.navigateByUrl(ROUTE_PATHS.GAME.children.FIND_NUMBER_GAME.children.START_SCREEN.fullPath)
   }


   private goToResultScreen() {
      this.stopTimer();
      this.router.navigateByUrl(
         ROUTE_PATHS.GAME.children.FIND_NUMBER_GAME.children.SUMMARY_GAME_SCREEN.fullPath.replace(':gameId', this.gameId()!)
      )
   }


   public updateGameStatusAfterSeclectEachNumber(lastSelected: number, elapsedTime: number) {
      this.currentGameInfo!.lastSelectedNumber = lastSelected
      this.currentGameInfo!.elapsedTime = elapsedTime;
      this.timerStartPoint = new Date();
      
      if(lastSelected > 90) return;
      
      this.triggerUpdateGameStatus.next(this.currentGameInfo!);
   }


   public updateGameStatus() {
      this.triggerUpdateGameStatus
         .pipe(
            debounceTime(5000),
            takeUntilDestroyed(this.destroyRef),
            switchMap((game: FindNumberGameDTO) => this.findNumberGameService.updateGameInfo(game))
         ).subscribe({
            error: (err) => {
               this.exitGame();
            }
         })
   }

   private startTimer(startPoint?: Date): void {
      this.timerStartPoint = startPoint || new Date();

      if (this.timeInterval) {
         clearInterval(this.timeInterval);
      }

      this.timeInterval = setInterval(() => {
         const diffFromStart = (new Date().getTime() - this.timerStartPoint!.getTime()) / 1000;
         const newTimerValue = diffFromStart + Number(this.currentGameInfo!.elapsedTime);
         if (newTimerValue - this.timer > 10) {
            this.findNumberGameService.shuffleNumbers.next(true);
         }
         this.timer = Math.round(newTimerValue);
         this.timeToDisplay.set(this.findNumberGameService.convertTimerToTimeDisplay(this.timer));
      }, 1000)
   }


   private stopTimer(): void {
      clearInterval(this.timeInterval);
   }


   protected getHistories() {
      if (this.findNumberGameService.gameHistories().length) return;
      this.findNumberGameService.getGameHistories()
         .pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => this.loaderService.hide())
         ).subscribe()
   }
}

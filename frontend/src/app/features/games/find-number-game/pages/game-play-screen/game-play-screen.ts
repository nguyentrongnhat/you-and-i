import { Component, computed, DestroyRef, effect, inject, input, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { debounceTime, finalize, Subject, switchMap, take, tap } from 'rxjs';
import { MenuModule } from 'primeng/menu';
import { SpeedDialModule } from 'primeng/speeddial';
import { BUTTON_STYLE, GAME_DIFFICULTY_LEVEL, GAME_STATUSES } from '../../../../../core/enums';
import { LoaderService } from '../../../../../services/loader.service';
import { GameTable } from '../../components/game-table/game-table';
import { FindNumberGameService } from '../../services/findnumber.service';
import { FindNumberGameDTO } from '../../../../../core/interfaces/find-number-game.dto';
import { Router } from '@angular/router';
import { ROUTE_PATHS } from '../../../../../core/constants/route-paths';
import { subscribe } from 'diagnostics_channel';

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

   protected currentSelectedNumber = signal<number>(0);

   protected timeToDisplay = signal<string>('00:00:00')

   protected timeInterval!: ReturnType<typeof setInterval>;

   protected GAME_STATUSES = GAME_STATUSES;

   protected lastFinishTime = signal<number>(0);

   protected TOTAL_NUMBERS = 100;

   protected currentGameInfo = computed(() => this.findNumberGameService.currentGameInfo() as FindNumberGameDTO);

   private findNumberGameService = inject(FindNumberGameService);

   private loaderService = inject(LoaderService);

   private destroyRef = inject(DestroyRef);

   private triggerUpdateGameStatus = new Subject<FindNumberGameDTO>();

   private router = inject(Router);

   private BUTTON_STYLE = BUTTON_STYLE;

   private timerStartPoint: Date | null = null;

   private timerStartPointTemp: number | null = null;

   protected bestTime = computed<number | null>(() => {
      const histories = this.findNumberGameService.gameHistories();
      if (!histories.length) return null;
      return Math.min(...histories.map((h) => h.timeToFinish));
   });

   protected bestTimeDisplay = computed(() => {
      const best = this.bestTime();
      return best === null ? '--' : this.findNumberGameService.convertTimerToTimeDisplay(best);
   });

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


   constructor() {
      effect(() => {
         const currentGameId = this.gameId();
         if (!currentGameId) return;
         untracked(() => this.getCurrentGameInfo(currentGameId));
      })
   }


   ngOnInit(): void {
      this.getHistories();
      this.updateGameStatus();
   }


   private getCurrentGameInfo(gameId: string) {

      if (this.currentGameInfo()?.id != gameId) {
         this.findNumberGameService.currentGameInfo.set(undefined);
      }

      if (this.currentGameInfo()) {
         this.loaderService.hide();
         this.loadGameStates();
         return;
      }
      
      this.findNumberGameService.getCurrentGameInfoById(gameId).pipe(
         takeUntilDestroyed(this.destroyRef),
         finalize(() => this.loaderService.hide())
      ).subscribe({
         next: (game: FindNumberGameDTO) => {
            this.loadGameStates();
         }
      });
   }


   private loadGameStates() {
      const gameStatus = this.currentGameInfo()?.gameStatus;
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
      const gameData = this.currentGameInfo();
      gameData.gameStatus = GAME_STATUSES.PLAYING
      gameData.startTime = new Date();
      gameData.totalNumbersToFind = this.TOTAL_NUMBERS;
      gameData.difficultyLevel = GAME_DIFFICULTY_LEVEL.NORMAL;

      this.findNumberGameService.updateGameInfo(gameData!).subscribe();
      this.gameCurrentStatus.set(GAME_STATUSES.PLAYING);
      this.startTimer();
   }


   private loadGameFromLastUpdateInDB() {
      
      this.gameCurrentStatus.set(GAME_STATUSES.PLAYING);
      this.currentSelectedNumber.set(this.currentGameInfo()?.lastSelectedNumber || 0);
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

      const gameData = this.currentGameInfo();

      console.log('load game from last update in db: ', new Date(gameData.updateAt))
      
      this.startTimer(new Date(gameData.updateAt));
   }


   private resumeFromPause() {
      this.gameCurrentStatus.set(GAME_STATUSES.PLAYING);
      this.currentSelectedNumber.set(this.currentGameInfo()?.lastSelectedNumber);
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

      this.startTimer();

      const gameData = this.currentGameInfo();
      gameData.gameStatus = GAME_STATUSES.PLAYING
      this.findNumberGameService.updateGameInfo(gameData!).subscribe();
   }


   private loadPausedGame() {
      this.stopTimer();
      this.gameCurrentStatus.set(GAME_STATUSES.PAUSED);

      const gameData = this.currentGameInfo();
      this.currentSelectedNumber.set(gameData?.lastSelectedNumber ?? 0);
      this.timeToDisplay.set(this.findNumberGameService.convertTimerToTimeDisplay(Number(gameData?.elapsedTime) ?? 0));
      
      this.items.set([
         {
            label: 'Resume',
            icon: 'pi pi-play-circle',
            command: () => this.resumeFromPause(),
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


   private pauseGame() {
      this.stopTimer();
      this.gameCurrentStatus.set(GAME_STATUSES.PAUSED);

      const gameData = this.currentGameInfo();
      gameData.gameStatus = GAME_STATUSES.PAUSED;
      gameData.elapsedTime = this.timer.toString();
      this.findNumberGameService.updateGameInfo(gameData).subscribe();
      
      this.items.set([
         {
            label: 'Resume',
            icon: 'pi pi-play-circle',
            command: () => this.resumeFromPause(),
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


   protected finishGame(): void {
      this.stopTimer();
      this.loaderService.show();
      this.lastFinishTime.set(this.timer);
      this.findNumberGameService.finishGame(this.gameId()!, this.timer)
         .pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => this.loaderService.hide()),
         )
         .subscribe({
            next: (game: FindNumberGameDTO) => {
               this.findNumberGameService.currentGameInfo.set(game);
               this.goToResultScreen();
            },
            error: (err) => {
               console.log(err)
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
      const gameData = { ...this.currentGameInfo() };
      gameData.lastSelectedNumber = lastSelected
      gameData.elapsedTime = elapsedTime.toString();
      if(lastSelected > 90) return;
      this.triggerUpdateGameStatus.next(gameData);
   }


   public updateGameStatus() {
      this.triggerUpdateGameStatus
         .pipe(
            debounceTime(5000),
            takeUntilDestroyed(this.destroyRef),
            switchMap(
               (game: FindNumberGameDTO) => this.findNumberGameService.updateGameInfo(game))
         ).subscribe({
            next: () => {
               this.timerStartPoint = new Date(this.timerStartPointTemp!);
            }
         })
   }


   protected onSelectNumber(num: number) {
      this.currentSelectedNumber.set(num);
      this.timerStartPointTemp = Number(new Date()) - 300;
      this.updateGameStatusAfterSeclectEachNumber(this.currentSelectedNumber(), this.timer)
      if (this.currentSelectedNumber() === this.TOTAL_NUMBERS) {
         this.finishGame();
      }
   }


   private startTimer(startPoint?: Date): void {
      console.log('start timer with start point: ', startPoint)
      this.timerStartPoint = startPoint || new Date();

      if (this.timeInterval) {
         clearInterval(this.timeInterval);
      }

      this.timeInterval = setInterval(() => {
         const diffFromStart = (new Date().getTime() - this.timerStartPoint!.getTime()) / 1000;
         const newTimerValue = diffFromStart + Number(this.currentGameInfo()?.elapsedTime);
         if (newTimerValue - this.timer > 5) {
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

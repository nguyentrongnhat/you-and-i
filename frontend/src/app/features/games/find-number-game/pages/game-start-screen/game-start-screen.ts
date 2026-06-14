import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
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
import { LoaderService } from '../../../../../services/loader.service';
import { GameHistories } from '../../components/game-histories/game-histories';
import { FindNumberGameService } from '../../services/findnumber.service';
import { GAME_DIFFICULTY_LEVEL } from '../../../../../core/enums';
import { FindNumberGameDTO } from '../../../../../core/interfaces/find-number-game.dto';

@Component({
   selector: 'app-game-start-screen',
   imports: [
      ButtonModule,
      DialogModule,
      ProgressBarModule,
      TagModule,
      MenuModule,
      SpeedDialModule,
      GameHistories
   ],
   templateUrl: './game-start-screen.html',
   styleUrl: './game-start-screen.scss',
})
export class GameStartScreen {
   protected readonly TOTAL_NUMBERS = 3;

   private readonly findNumberGameService = inject(FindNumberGameService);
   
   private readonly loaderService = inject(LoaderService);
   
   private readonly destroyRef = inject(DestroyRef);
   
   private readonly router = inject(Router);
   
   protected showGameHistories = signal<boolean>(false);

   protected totalGames = computed(() => this.findNumberGameService.gameHistories().length);


   protected bestTime = computed<number | null>(() => {
      const histories = this.findNumberGameService.gameHistories();
      if (!histories.length) return null;
      return Math.min(...histories.map((h) => h.timeToFinish));
   });


   protected bestTimeDisplay = computed(() => {
      const best = this.bestTime();
      return best === null ? '--' : this.findNumberGameService.convertTimerToTimeDisplay(best);
   });


   ngOnInit(): void {
      this.getHistories();
   }


   protected showGameHistoriesDialog() {
      this.showGameHistories.set(true);
   }


   protected getHistories() {
      this.loaderService.show();
      this.findNumberGameService.getGameHistories()
         .pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => this.loaderService.hide())
         ).subscribe()
   }


   protected startGame(): void {
      this.createNewGame();
   }


   public createNewGame() {
      this.loaderService.show();
      this.findNumberGameService.createNewGame(this.TOTAL_NUMBERS, GAME_DIFFICULTY_LEVEL.NORMAL)
         .pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => this.loaderService.hide())
         )
         .subscribe({
            next: (newGame: FindNumberGameDTO) => {
               this.findNumberGameService.currentGameInfo.set(newGame);
               this.navigationToPlayGameScreen(newGame.id);
            },
            error: (err) => {
               console.log('Create new game Failed: ', err)
            }
         })
   }


   private navigationToPlayGameScreen(gameId: string): void {
      this.router.navigateByUrl(
         ROUTE_PATHS
            .GAME
            .children
            .FIND_NUMBER_GAME
            .children
            .PLAY_GAME_SCREEN.fullPath.replace(':gameId', gameId)
      )
   }
}

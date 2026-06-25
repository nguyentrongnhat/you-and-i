import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { ProgressBarModule } from 'primeng/progressbar';
import { SpeedDialModule } from 'primeng/speeddial';
import { TagModule } from 'primeng/tag';
import { finalize, forkJoin } from 'rxjs';
import { BUTTON_STYLE, GAME_DIFFICULTY_LEVEL, ROLE } from '../../../../../core/enums';
import { FindNumberGameDTO } from '../../../../../core/interfaces/find-number-game.dto';
import { LoaderService } from '../../../../../services/loader.service';
import { NavigationService } from '../../../../../services/navigation.service';
import { FindNumberGameService } from '../../services/findnumber.service';
import { FormsModule } from '@angular/forms';
import { GameOverview } from '../../components/game-overview/game-overview';
import { UserService } from '../../../../user-management/services/user.service';

@Component({
   selector: 'app-game-start-screen',
   imports: [
      ButtonModule,
      DialogModule,
      ProgressBarModule,
      TagModule,
      MenuModule,
      SpeedDialModule,
      GameOverview,
      ConfirmDialogModule,
      FormsModule,
   ],
   providers: [ConfirmationService],
   templateUrl: './game-start-screen.html',
   styleUrl: './game-start-screen.scss',
})
export class GameStartScreen {
   protected readonly TOTAL_NUMBERS = 100;

   private readonly findNumberGameService = inject(FindNumberGameService);
   
   private readonly loaderService = inject(LoaderService);
   
   private readonly destroyRef = inject(DestroyRef);
   
   private unfinishedGames = signal<FindNumberGameDTO | undefined>(undefined);

   private readonly navigationService = inject(NavigationService);
   
   protected showGameHistories = signal<boolean>(false);

   protected continueOrNewGameDialogVisible = signal<boolean>(false);

   protected totalGames = computed(() => this.findNumberGameService.gameHistories().totalGamesPlayed);

   protected BUTTON_STYLE = BUTTON_STYLE;

   protected userService = inject(UserService);

   protected ROLE = ROLE;


   protected bestTime = computed<number | null>(() => {
      const histories = this.findNumberGameService.gameHistories();
      if (!histories.history.length) return null;
      return Math.min(...histories.history.map((h) => h.completionTime));
   });


   protected bestTimeDisplay = computed(() => {
      const best = this.bestTime();
      return best === null ? '--' : this.findNumberGameService.convertTimerToTimeDisplay(best);
   });


   ngOnInit(): void {
      this.getData();
   }


   private getData() {
      this.loaderService.show();
      forkJoin([
         this.findNumberGameService.getGameHistories(), 
         this.findNumberGameService.getBestRecordsRanking()
      ])
      .pipe(
         takeUntilDestroyed(this.destroyRef),
         finalize(() => this.loaderService.hide())
      ).subscribe({
         next: ([histories, bestRecords]) => {
            if (histories.unfinishedGames.length > 0) {
               this.unfinishedGames.set(histories.unfinishedGames[0]);
            }
         }
      })
   }


   protected showGameHistoriesDialog() {
      this.showGameHistories.set(true);
   }


   protected startGame(event: Event): void {
      this.findNumberGameService.currentSeclectedNumber.set(0);

      if(!this.unfinishedGames()) {
         this.createNewGame();
         return;
      }

      this.continueOrNewGameDialogVisible.set(true);
   }


   public createNewGame() {
      this.loaderService.show();
      this.findNumberGameService.createNewGame(this.TOTAL_NUMBERS, GAME_DIFFICULTY_LEVEL.NORMAL)
      .pipe(takeUntilDestroyed(this.destroyRef))
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


   public loadUnfinishedGame() {
      this.loaderService.show();
      this.findNumberGameService.currentGameInfo.set(this.unfinishedGames() as FindNumberGameDTO);
      this.navigationToPlayGameScreen((this.unfinishedGames() as FindNumberGameDTO).id);
   }


   private navigationToPlayGameScreen(gameId: string): void {
      this.navigationService.goToFindNumberGamePlay(gameId);
   }
}

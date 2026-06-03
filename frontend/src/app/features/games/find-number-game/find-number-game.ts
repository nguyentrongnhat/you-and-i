import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { take } from 'rxjs';
import { HttpClientService } from '../../../services/http-client.service';
import { GameHistories } from './components/game-histories/game-histories';
import { GameTable } from './components/game-table/game-table';
import { FindNumberGameService } from './services/findnumber.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  imports: [GameTable, ButtonModule, DialogModule, GameHistories],
  templateUrl: './find-number-game.html',
  styleUrl: './find-number-game.scss',
})
export class FindNumberGame {
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

	protected gameHistories = signal<any[]>([]);

  protected showGameHistoriesDialog() {
    this.visible.set(true);
  }


  protected onSelectNumber(num: number) {
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
      this.timeToDisplay.set(this.convertTimerToTimeDisplay(this.timer));
    }, 1000)
  }


  private stopTimer() {
    clearInterval(this.timeInterval);
    this.timer = 0;
  }


  protected finishGame(): void {
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
    .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        console.log('game history: ', res)
        this.gameHistories.set(res)
        console.log('game history: ', this.gameHistories())
      }
    })
  }


  protected convertTimerToTimeDisplay(seconds: number) {
    const hh = Math.floor(seconds / 3600)
    const mm = Math.floor((seconds % 3600) / 60)
    const ss = Math.floor(((seconds % 3600) % 60) % 60)
    return `${hh > 9 ? hh : 0 + hh.toString()} : ${mm > 9 ? mm : 0 + mm.toString()} : ${ss > 9 ? ss : 0 + ss.toString()}`
  }
}

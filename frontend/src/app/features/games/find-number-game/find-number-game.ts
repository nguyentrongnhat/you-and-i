import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { take } from 'rxjs';
import { HttpClientService } from '../../../services/http-client.service';
import { GameHistories } from './components/game-histories/game-histories';
import { GameTable } from './components/game-table/game-table';

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
  FIND_NUMBER_GAME_STATUSES = FIND_NUMBER_GAME_STATUSES;

  gameCurrentStatus = signal<FIND_NUMBER_GAME_STATUSES>(FIND_NUMBER_GAME_STATUSES.NONE);

  gameFinished = signal<boolean>(false);

  visible = signal<boolean>(false);

  private readonly httpClient = inject(HttpClientService);

  private readonly router = inject(Router);

	protected timer: number = 0;

	protected timeToDisplay = signal<string>('00 : 00 : 00')

	protected timeInterval!: ReturnType<typeof setInterval>;

	protected currentGameId: number = 0;

	protected gameHistories = signal<any[]>([]);

  showGameHistoriesDialog() {
    this.visible.set(true);
  }

  onSelectNumber(num: number) {
    console.log('number: ', num)
    if(num === 2) {
      this.finishGame();
    }
  }

  startGame() {
    console.log('start game')

    this.httpClient.post('/game/find-number-game', {startTime: new Date()}).pipe(take(1)).subscribe({
      next: (res: any) => {
        console.log("game info: ", res);
        this.currentGameId = res.gameId
        this.gameCurrentStatus.set(FIND_NUMBER_GAME_STATUSES.STARTED);
        this.startTimer()
      },
      error: (err) => {
        console.log(err)
      }
    })
  }


  startTimer(): void {
    if(this.timeInterval) {
      clearInterval(this.timeInterval);
    }

    this.timeInterval = setInterval(() => {
      this.timer ++;
      this.timeToDisplay.set(this.convertTimerToTimeDisplay(this.timer));
    }, 1000)
  }


  stopTimer() {
    clearInterval(this.timeInterval);
    this.timer = 0;
  }


  finishGame(): void {
    this.gameCurrentStatus.set(FIND_NUMBER_GAME_STATUSES.FINISHED)
    this.callAPIFinishGame().subscribe({
      next: (res: any) => {
        console.log('finish game: ', res)

        this.stopTimer();
        this.getHistories()
      }
    })
  }


  getHistories() {
    this.callAPILoadGameHistory().subscribe({
      next: (res: any) => {
        console.log('game history: ', res)
        this.gameHistories.set(res)
        console.log('game history: ', this.gameHistories())
      }
    })
  }


  convertTimerToTimeDisplay(seconds: number) {
    const hh = Math.floor(seconds / 3600)
    const mm = Math.floor((seconds % 3600) / 60)
    const ss = Math.floor(((seconds % 3600) % 60) % 60)
    return `${hh > 9 ? hh : 0 + hh.toString()} : ${mm > 9 ? mm : 0 + mm.toString()} : ${ss > 9 ? ss : 0 + ss.toString()}`
  }


  callAPIstartGame() {
    const startGameInfo = {
      userId: 1,
      startTime: new Date()
    }
    return this.httpClient.post('/game/find-number-game/start-game', startGameInfo)
  }


  callAPIFinishGame() {
    const finishGameInfo = {
      gameId: this.currentGameId.toString(),
      timeToFinish: this.timer.toString(),
      endTime: new Date()
    }
    return this.httpClient.post('/game/find-number-game/finish-game', finishGameInfo)
  }


  callAPILoadGameHistory() {
    return this.httpClient.get('/game/find-number-game/history')
  }
}

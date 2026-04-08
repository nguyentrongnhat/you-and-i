import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { take } from 'rxjs';
import { UsernamePasswordLoginResponse } from '../../core/interfaces/user.dtos';
import { AuthService } from '../auth/services/auth.service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [ButtonModule, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard{

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly httpClient = inject(HttpClient)

  public title = signal<string>('')
  public callGetTextNum = 0;


  isStarted = signal<boolean>(false);
  timer: number = 0;
  timeToDisplay = signal<string>('00 : 00 : 00')
  timeInterval!: ReturnType<typeof setInterval>;
  currentGameId: number = 0;
  gameHistories = signal<any[]>([]);


  ngOnInit(): void {
    this.getHistories()
  }

  getText() {
    this.httpClient.get('http://localhost:8080', { responseType: 'text' }).pipe(take(1)).subscribe({
      next: res => {
        this.callGetTextNum++;
        this.title.set(res + ' : ' + this.callGetTextNum)
      },
      error: (err) => {
        console.log(err)
      }
    });
  }

  refreshToken() {
    console.log('refresh token')
    this.authService.refreshToken().subscribe({
      next: (res: UsernamePasswordLoginResponse) => {
        this.authService.setAccessToken(res.accessToken);
      },
      error: err => {
        console.log('Login error: ', err);
      }
    })
  }

  sendMail() {
    console.log('send mail')
    this.httpClient.get('http://localhost:8080/mail/test').pipe(take(1)).subscribe({
      next: (res) => {
        console.log('OK');
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  startGame() {
    console.log('start game')
    this.router.navigateByUrl('game/find-number-game')
    // this.httpClient.post('http://localhost:8080/api/game/find-number-game', {startTime: new Date()}).pipe(take(1)).subscribe({
    //   next: (res: any) => {
    //     console.log("game info: ", res);
    //     this.currentGameId = res.gameId
    //     this.isStarted.set(true);
    //     this.timeInterval = setInterval(() => {
    //       this.timer ++;
    //       this.timeToDisplay.set(this.convertTimerToTimeDisplay(this.timer));
    //     }, 1000)
    //   },
    //   error: (err) => {
    //     console.log(err)
    //   }
    // })
  }

  startTimer(): void {
    this.callAPIstartGame().subscribe({
      next: (res: any) => {
        console.log(res)
        this.currentGameId = res.data.gameId
        this.isStarted.set(true);
        this.timeInterval = setInterval(() => {
          this.timer ++;
          this.timeToDisplay.set(this.convertTimerToTimeDisplay(this.timer));
        }, 1000)
      }
    })
    
  }

  stopTimer(): void {
    this.callAPIFinishGame().subscribe({
      next: (res: any) => {
        console.log('finish game: ', res)
        clearInterval(this.timeInterval);
        this.isStarted.set(false);
        this.timer = 0;

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
    return this.httpClient.post('http://localhost:8080/api/game/find-number-game/start-game', startGameInfo)
  }

  callAPIFinishGame() {
    const finishGameInfo = {
      gameId: this.currentGameId.toString(),
      timeToFinish: this.timer.toString(),
      endTime: new Date()
    }
    return this.httpClient.post('http://localhost:8080/api/game/find-number-game/finish-game', finishGameInfo)
  }

  callAPILoadGameHistory() {
    return this.httpClient.get('http://localhost:8080/api/game/find-number-game/history')
  }
  
}

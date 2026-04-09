import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { take } from 'rxjs';
import { UsernamePasswordLoginResponse } from '../../core/interfaces/user.dtos';
import { HttpClientService } from '../../services/http-client.service';
import { AuthService } from '../auth/services/auth.service';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-dashboard',
  imports: [ButtonModule, DatePipe, CardModule, TableModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit{

	private readonly authService = inject(AuthService);

	private readonly router = inject(Router);

	private readonly httpClient = inject(HttpClientService)

	protected myDisplayText = signal<string>('')

	public callGetTextNum = 0;

	protected isStarted = signal<boolean>(false);

	protected timer: number = 0;

	protected timeToDisplay = signal<string>('00 : 00 : 00')

	protected timeInterval!: ReturnType<typeof setInterval>;

	protected currentGameId: number = 0;

	protected gameHistories = signal<any[]>([]);

  protected items = signal<any[]>([
    {
      title: 'Find Number Game',
      subTitle: 'Chơi game và Nhớ anh',
      description: 'Tìm các số lần lượt từ 1 đến 100 trong điều kiện thách thức về mặt thời gian',
      image: 'images/find-number-game.png',
      url: 'game/find-number-game'
    },
    {
      title: 'Find Number Game',
      subTitle: 'Chơi game và Nhớ anh',
      description: 'Tìm các số lần lượt từ 1 đến 100 trong điều kiện thách thức về mặt thời gian',
      image: 'images/find-number-game.png',
      url: 'game/find-number-game'
    },
    {
      title: 'Find Number Game',
      subTitle: 'Chơi game và Nhớ anh',
      description: 'Tìm các số lần lượt từ 1 đến 100 trong điều kiện thách thức về mặt thời gian',
      image: 'images/find-number-game.png',
      url: 'game/find-number-game'
    },
    {
      title: 'Find Number Game',
      subTitle: 'Chơi game và Nhớ anh',
      description: 'Tìm các số lần lượt từ 1 đến 100 trong điều kiện thách thức về mặt thời gian',
      image: 'images/find-number-game.png',
      url: 'game/find-number-game'
    },
    {
      title: 'Find Number Game',
      subTitle: 'Chơi game và Nhớ anh',
      description: 'Tìm các số lần lượt từ 1 đến 100 trong điều kiện thách thức về mặt thời gian',
      image: 'images/find-number-game.png',
      url: 'game/find-number-game'
    }
  ]);


	ngOnInit(): void {
		this.getHistories()
	}


	getText() {
		this.httpClient.get('', { responseType: 'text' }).pipe(take(1)).subscribe({
			next: res => {
				this.callGetTextNum++;
				this.myDisplayText.set(res + ' : ' + this.callGetTextNum)
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
    this.httpClient.get('/mail/test').pipe(take(1)).subscribe({
      next: (res) => {
        console.log('OK');
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  navigateToItem(url: string) {
    this.router.navigateByUrl(url);
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

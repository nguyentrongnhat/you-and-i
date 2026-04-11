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
  imports: [ButtonModule, CardModule, TableModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {

	private readonly authService = inject(AuthService);

	private readonly router = inject(Router);

	private readonly httpClient = inject(HttpClientService)

	protected myDisplayText = signal<string>('')

	public callGetTextNum = 0;

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
}

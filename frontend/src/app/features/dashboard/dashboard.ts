import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { take } from 'rxjs';
import { UsernamePasswordLoginResponse } from '../../core/interfaces/user.dtos';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [ButtonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard{
  private readonly http = inject(HttpClient);
  public title = signal<string>('')
  public callGetTextNum = 0;

  private readonly authService = inject(AuthService);

  getText() {
    this.http.get('http://localhost:8080', { responseType: 'text' }).pipe(take(1)).subscribe({
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
    this.http.get('http://localhost:8080/mail/test').pipe(take(1)).subscribe({
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
    this.http.get('http://localhost:8080/api/game/find-number-game').pipe(take(1)).subscribe({
      next: (res) => {
        console.log("game info: ", res);
      },
      error: (err) => {
        console.log(err)
      }
    })
  }
  
}

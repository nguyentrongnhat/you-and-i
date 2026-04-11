import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClientService } from '../../../../../services/http-client.service';
import { DatePipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-game-histories',
  imports: [DatePipe, CardModule, TableModule],
  templateUrl: './game-histories.html',
  styleUrl: './game-histories.scss',
})
export class GameHistories implements OnInit {
  
  protected gameHistories = signal<any[]>([]);

  private readonly httpClient = inject(HttpClientService)

  ngOnInit(): void {
    console.log('get game hisoty')
    this.getHistories();
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


  callAPILoadGameHistory() {
    console.log('trigger api get history')
    return this.httpClient.get('/game/find-number-game/history')
  }
}

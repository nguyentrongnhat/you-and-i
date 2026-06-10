import { inject, Injectable, signal } from "@angular/core";
import { HttpClientService } from "../../../../services/http-client.service";
import { tap } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class FindNumberGameService {
    private readonly httpClient = inject(HttpClientService);


    public gameHistories = signal<any[]>([]);


    public startGame() {
        return this.httpClient.post('/game/find-number-game', {startTime: new Date()})
    }


    public finishGame(gameId: number, timeToFinish: number) {
        const finishGameInfo = {
            gameId: gameId.toString(),
            timeToFinish: timeToFinish.toString(),
            endTime: new Date()
        }
        return this.httpClient.post('/game/find-number-game/finish-game', finishGameInfo)
    }


    public getGameHistories() {
        return this.httpClient.get('/game/find-number-game/history').pipe(
            tap((histories: any) => {
                this.gameHistories.set(histories);
            })
        )
    }


    public convertTimerToTimeDisplay(seconds: number) {
        const hh = Math.floor(seconds / 3600)
        const mm = Math.floor((seconds % 3600) / 60)
        const ss = Math.floor(((seconds % 3600) % 60) % 60)
        return `${hh.toString().padStart(2, '0')} : ${mm.toString().padStart(2, '0')} : ${ss.toString().padStart(2, '0')}`
    }
}   
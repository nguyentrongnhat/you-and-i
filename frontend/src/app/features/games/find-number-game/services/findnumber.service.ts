import { inject, Injectable } from "@angular/core";
import { HttpClientService } from "../../../../services/http-client.service";

@Injectable({
    providedIn: 'root'
})
export class FindNumberGameService {
    private readonly httpClient = inject(HttpClientService);

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
        return this.httpClient.get('/game/find-number-game/history')
    }
}   
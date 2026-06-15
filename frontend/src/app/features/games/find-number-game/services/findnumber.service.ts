import { inject, Injectable, signal } from "@angular/core";
import { HttpClientService } from "../../../../services/http-client.service";
import { Observable, of, Subject, tap } from "rxjs";
import { GAME_DIFFICULTY_LEVEL } from "../../../../core/enums";
import { FindNumberGameDTO } from "../../../../core/interfaces/find-number-game.dto";

@Injectable({
    providedIn: 'root'
})
export class FindNumberGameService {
    private readonly httpClient = inject(HttpClientService);

    public gameHistories = signal<any[]>([]);

    public currentGameInfo = signal<FindNumberGameDTO | undefined>(undefined);

    public shuffleNumbers: Subject<boolean> = new Subject<boolean>();

    public createNewGame(totalNumbersToFind: number, difficultyLevel: GAME_DIFFICULTY_LEVEL): Observable<FindNumberGameDTO> {
        const body = {
            totalNumbersToFind,
            difficultyLevel
        }
        return this.httpClient.post<FindNumberGameDTO>('/game/find-number-game', body)
    }


    public getCurrentGameInfoById(gameId: string): Observable<FindNumberGameDTO> {
        return this.httpClient.get<FindNumberGameDTO>('/game/find-number-game/:gameId'.replace(':gameId', gameId))
            .pipe(
                tap((game: FindNumberGameDTO) => {
                    this.currentGameInfo.set(game);
                })
            )
    }


    public updateGameInfo(game: FindNumberGameDTO): Observable<FindNumberGameDTO> {
        return this.httpClient.put<FindNumberGameDTO>('/game/find-number-game/update', game)
            .pipe(
                tap((game: FindNumberGameDTO) => {
                    this.currentGameInfo.set(game);
                })
            )
    }


    public finishGame(gameId: string, completionTime: number): Observable<FindNumberGameDTO> {
        const finishGameInfo = {
            gameId: gameId.toString(),
            completionTime: completionTime.toString(),
            endTime: new Date()
        }
        return this.httpClient.post<FindNumberGameDTO>('/game/find-number-game/finish-game', finishGameInfo)
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
        return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`
    }
}   
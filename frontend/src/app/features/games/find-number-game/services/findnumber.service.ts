import { computed, inject, Injectable, signal } from "@angular/core";
import { HttpClientService } from "../../../../services/http-client.service";
import { catchError, Observable, of, Subject, tap, throwError } from "rxjs";
import { GAME_DIFFICULTY_LEVEL, MESSAGE_TYPE, ROLE } from "../../../../core/enums";
import { FindNumberGameBestRecordDTO, FindNumberGameDTO, FindNumberGameHistory } from "../../../../core/interfaces/find-number-game.dto";
import { ToastService } from "../../../../services/toast.service";
import { UserService } from "../../../user-management/services/user.service";

@Injectable({
    providedIn: 'root'
})
export class FindNumberGameService {
    private readonly httpClient = inject(HttpClientService);

    private readonly userService = inject(UserService);

    public currentSeclectedNumber = signal<number>(0);

    public curentTargetNumber = computed(() => this.currentSeclectedNumber() + 1);

    public gameHistories = signal<FindNumberGameHistory>({ history: [], bestRecord: {} as FindNumberGameBestRecordDTO, unfinishedGames: [], totalGamesPlayed: 0 });

    public bestRecordsRanking = signal<FindNumberGameBestRecordDTO[]>([]);

    public currentGameInfo = signal<FindNumberGameDTO | undefined>(undefined);

    public shuffleNumbers: Subject<boolean> = new Subject<boolean>();

    private readonly toastService = inject(ToastService);

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
                }),
                catchError((err) => {
                    if(err.error.status === 404) {
                        const toastSummary = 'The game is not exist anymore';
                        const toastDetail = 'The game is not exist anymore. Please start a new game.';
                        this.toastService.showToast(MESSAGE_TYPE.ERROR, toastSummary, toastDetail);
                    }
                    else {
                        const toastSummary = 'Can not update game';
                        const toastDetail = err.error.message;
                        this.toastService.showToast(MESSAGE_TYPE.ERROR, toastSummary, toastDetail);
                    }

                    return throwError(() => err);
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


    public getGameHistories(): Observable<FindNumberGameHistory> {
        return this.httpClient.get<FindNumberGameHistory>('/game/find-number-game/history').pipe(
            tap((histories: FindNumberGameHistory) => {
                this.gameHistories.set(histories);
            })
        )
    }


    public getUnfinishedGame(): Observable<FindNumberGameDTO[]> {
        return this.httpClient.get<FindNumberGameDTO[]>('/game/find-number-game/unfinish-games')
    }


    public convertTimerToTimeDisplay(seconds: number) {
        const hh = Math.floor(seconds / 3600)
        const mm = Math.floor((seconds % 3600) / 60)
        const ss = Math.floor(((seconds % 3600) % 60) % 60)
        return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`
    }


    public getBestRecordsRanking(): Observable<FindNumberGameBestRecordDTO[]> {
        if(!this.userService.hasRoles([ROLE.SUPER_ADMIN, ROLE.ADMIN], 'OR')) {
            return of([])
        }
        return this.httpClient.get<FindNumberGameBestRecordDTO[]>('/game/find-number-game/best-records-ranking').pipe(
            tap((bestRecords: FindNumberGameBestRecordDTO[]) => {
                if(!this.userService.hasRoles([ROLE.SUPER_ADMIN])) {
                    bestRecords = bestRecords.filter((record: FindNumberGameBestRecordDTO) => record.playerUsername !== 'superadmin@admin.com');
                }
                this.bestRecordsRanking.set(bestRecords);
            })
        )
    }
}   
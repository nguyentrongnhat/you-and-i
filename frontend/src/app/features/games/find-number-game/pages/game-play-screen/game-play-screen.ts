import { Component, computed, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { debounceTime, finalize, Subject, switchMap } from 'rxjs';

import { MenuModule } from 'primeng/menu';
import { SpeedDialModule } from 'primeng/speeddial';
import { BUTTON_STYLE, GAME_STATUSES } from '../../../../../core/enums';
import { LoaderService } from '../../../../../services/loader.service';
import { GameTable } from '../../components/game-table/game-table';
import { FindNumberGameService } from '../../services/findnumber.service';
import { FindNumberGameDTO } from '../../../../../core/interfaces/find-number-game.dto';
import { Router } from '@angular/router';
import { ROUTE_PATHS } from '../../../../../core/constants/route-paths';

@Component({
	selector: 'app-game-play-screen',
	imports: [
		GameTable,
		ButtonModule,
		DialogModule,
		ProgressBarModule,
		TagModule,
		MenuModule,
		SpeedDialModule
	],
	templateUrl: './game-play-screen.html',
	styleUrl: './game-play-screen.scss',
})
export class GamePlayScreen {
	protected gameId = input<string | undefined>(undefined);

	protected readonly TOTAL_NUMBERS = 100;

	private readonly findNumberGameService = inject(FindNumberGameService);
	
	private readonly loaderService = inject(LoaderService);
	
	private readonly destroyRef = inject(DestroyRef);
	
	protected gameCurrentStatus = signal<GAME_STATUSES>(GAME_STATUSES.NEW);

	protected timer: number = 0;

	protected currentSelectedNumber = signal<number>(0);

	protected timeToDisplay = signal<string>('00:00:00')

	protected timeInterval!: ReturnType<typeof setInterval>;

	private readonly BUTTON_STYLE = BUTTON_STYLE;

	protected GAME_STATUSES = GAME_STATUSES;

	protected lastFinishTime = signal<number>(0);

	private previousBest = signal<number | null>(null);


	/** Tổng số ván đã chơi */
	protected totalGames = computed(() => this.findNumberGameService.gameHistories().length);

	protected items = signal<any[]>([
		{
			label: 'Pause',
			icon: 'pi pi-pause',
			command: () => this.pauseGame(),
			style: this.BUTTON_STYLE.WARN
		},
		{
			label: 'Exit',
			icon: 'pi pi-sign-out',
			command: () => this.exitGame(),
			style: this.BUTTON_STYLE.DANGER
		}
	]);

	constructor() {
		effect(() => {
			const currentGameId = this.gameId();
			console.log('game id: ', this.gameId())
			if(!currentGameId) return;
			this.getCurrentGameInfo(currentGameId)
		})
	}

	
	/** Thời gian tốt nhất (giây) từ lịch sử */
	protected bestTime = computed<number | null>(() => {
		const histories = this.findNumberGameService.gameHistories();
		if (!histories.length) return null;
		return Math.min(...histories.map((h) => h.timeToFinish));
	});


	/** Hiển thị thời gian tốt nhất dạng chuỗi */
	protected bestTimeDisplay = computed(() => {
		const best = this.bestTime();
		return best === null ? '--' : this.findNumberGameService.convertTimerToTimeDisplay(best);
	});


	public triggerUpdateGameStatus = new Subject<FindNumberGameDTO>();

	private router = inject(Router);


	ngOnInit(): void {
		this.loaderService.hide();
		this.updateGameStatus();	
		setTimeout(() => {
			console.log(this.router.url)
			this.router.navigateByUrl(this.router.url)
		}, 500)
	}


	private getCurrentGameInfo(gameId: string) {
		const currentGameInfo = this.findNumberGameService.currentGameInfo();
		
		if(currentGameInfo?.id != gameId) {
			this.findNumberGameService.currentGameInfo.set(undefined);
		} 

		if(currentGameInfo) {
			this.triggerGameLogic();
		}
		else {
			this.findNumberGameService.getCurrentGameInfoById(gameId).subscribe({
				next: (game: FindNumberGameDTO) => {
					console.log('Game data: ', game)
					this.loaderService.hide();
				}
			})
		}
	}


	private triggerGameLogic() {
		const currentGameInfo = this.findNumberGameService.currentGameInfo();
		if (currentGameInfo!.gameStatus === GAME_STATUSES.NEW) {
			this.startNewGame();
		}

		else if (currentGameInfo!.gameStatus === GAME_STATUSES.PLAYING) {
			this.continueGame();
		}
	}


	private startNewGame() {
		this.gameCurrentStatus.set(GAME_STATUSES.PLAYING);
		this.startTimer();
		
		const gameData = this.findNumberGameService.currentGameInfo();
		gameData!.gameStatus = GAME_STATUSES.PLAYING
		gameData!.startTime = new Date();
		
		this.findNumberGameService.updateGameInfo(gameData!).subscribe({
			next: (gameinfo: FindNumberGameDTO) => {
				console.log('game already start: ', gameinfo)
			}
		})
	}


	private continueGame() {
		const gameData = this.findNumberGameService.currentGameInfo();
		this.gameCurrentStatus.set(GAME_STATUSES.PLAYING);
		this.currentSelectedNumber.set(gameData!.lastSelectedNumber);
		this.timer = Number(gameData!.elapsedTime)
		this.startTimer();
	}


	public updateGameStatusAfterSeclectEachNumber(lastSelected: number, elapsedTime: number) {
		const gameData = this.findNumberGameService.currentGameInfo() as FindNumberGameDTO;
		gameData.lastSelectedNumber = lastSelected
		gameData.elapsedTime = elapsedTime.toString();
		this.triggerUpdateGameStatus.next(gameData );
	}


	public updateGameStatus () {
		this.triggerUpdateGameStatus
		.pipe(
			debounceTime(5000),
			switchMap((game: FindNumberGameDTO) => this.findNumberGameService.updateGameInfo(game))
		).subscribe()
	}


	protected onSelectNumber(num: number) {

		this.currentSelectedNumber.set(num);

		this.updateGameStatusAfterSeclectEachNumber(this.currentSelectedNumber(), this.timer)

		if (this.currentSelectedNumber() === this.TOTAL_NUMBERS) {
			this.finishGame();
		}
	}


	protected updateGameInfo() {
		this.loaderService.show();
		const game: FindNumberGameDTO = {} as FindNumberGameDTO;
		this.findNumberGameService.updateGameInfo(game)
			.pipe(
				takeUntilDestroyed(this.destroyRef),
				finalize(() => this.loaderService.hide())
			)
			.subscribe({
				next: (res: any) => {
			
					this.previousBest.set(this.bestTime());
					this.lastFinishTime.set(0);
					this.currentSelectedNumber.set(0);
					this.timer = 0;
					this.startTimer()
				},
				error: (err) => {
					console.log(err)
				}
			})
	}


	private startTimer(): void {
		if (this.timeInterval) {
			clearInterval(this.timeInterval);
		}

		this.timeInterval = setInterval(() => {
			this.timer++;
			this.timeToDisplay.set(this.findNumberGameService.convertTimerToTimeDisplay(this.timer));
		}, 1000)
	}


	private pauseGame() {
		console.log('Pausing game...')

		this.gameCurrentStatus.set(GAME_STATUSES.PAUSED);

		this.stopTimer();

		this.items.set([
			{
				label: 'Resume',
				icon: 'pi pi-play-circle',
				command: () => this.resumeGame(),
				style: this.BUTTON_STYLE.PRIMARY
			},
			{
				label: 'Exit',
				icon: 'pi pi-sign-out',
				command: () => this.exitGame(),
				style: this.BUTTON_STYLE.DANGER
			}
		]);
	}


	private resumeGame() {

		this.gameCurrentStatus.set(GAME_STATUSES.PLAYING);

		this.startTimer();

		this.items.set([
			{
				label: 'Pause',
				icon: 'pi pi-pause',
				command: () => this.pauseGame(),
				style: this.BUTTON_STYLE.WARN
			},
			{
				label: 'Exit',
				icon: 'pi pi-sign-out',
				command: () => this.exitGame(),
				style: this.BUTTON_STYLE.DANGER
			}
		]);
	}


	private exitGame() {
		this.stopTimer();
		this.router.navigateByUrl(ROUTE_PATHS.GAME.children.FIND_NUMBER_GAME.children.START_SCREEN.fullPath)
	}


	private stopTimer() {
		clearInterval(this.timeInterval);
	}


	protected finishGame(): void {
		this.stopTimer();
		this.loaderService.show();
		this.lastFinishTime.set(this.timer);
		this.findNumberGameService.finishGame(this.gameId()!, this.timer)
			.pipe(
				takeUntilDestroyed(this.destroyRef),
				finalize(() => this.loaderService.hide()),
			)
			.subscribe({
				next: (res: any) => {
					this.exitGame()
				},
				error: (err) => {
					console.log(err)
				}
			})
	}
}

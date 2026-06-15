import { AfterViewInit, Component, computed, DestroyRef, effect, HostListener, inject, input, OnInit, output, signal } from '@angular/core';
import { PlatformService } from '../../../../../services/platform.service';
import { Number } from '../number/number';
import { NumberData } from '../../../../../core/type';
import { FindNumberGameService } from '../../services/findnumber.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
	selector: 'app-game-table',
	imports: [Number],
	templateUrl: './game-table.html',
	styleUrl: './game-table.scss',
})
export class GameTable implements OnInit, AfterViewInit {

	public currentNumber = input<number>(0);

	private readonly destroyRef = inject(DestroyRef);

	private findNumberGameService = inject(FindNumberGameService);

	screenWidth = signal(0);

	columns = computed(() => this.screenWidth() < 768 ? 5 : 10);

	numbers = signal<NumberData[]>(this.generateItems());

	onSelectNumber = output<number>();

	platformService = inject(PlatformService);

	ready = false;

	constructor() {
		effect(() => {	
			console.log('update selected number:', this.currentNumber());
		})
	}

	@HostListener('window:resize')
	onResize() {
		if (this.platformService.isBrowser()) {
			this.screenWidth.set(window.innerWidth);
		}
	}

	ngOnInit(): void {
		if (this.platformService.isBrowser()) {
			this.screenWidth.set(window.innerWidth);
		}

		this.onShuttleNumbers();
	}


	onShuttleNumbers() {
		this.findNumberGameService.shuffleNumbers.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
			this.numbers.set(this.generateItems());
		})
	}


	ngAfterViewInit(): void {
		if (this.platformService.isBrowser()) {
			this.screenWidth.set(window.innerWidth);

			setTimeout(() => {
				this.ready = true;
			});
		}
	}


	private generateItems(): NumberData[] {
		const arr = Array.from({ length: 100 }, (_, i) => i + 1);

		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}

		return arr.map(num => {
			return {
				value: num,
				rotate: this.random(-180, 170),
				tx: this.random(0, 100),
				ty: this.random(0, 100),
				fontSize: this.random(13, 20)
			};
		});
	}


	private random(min: number, max: number) {
		return Math.random() * (max - min) + min;
	}


	public selectNumber() {
		this.onSelectNumber.emit(this.currentNumber()+1)
	}
}


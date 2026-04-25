import { AfterViewInit, Component, computed, HostListener, inject, OnDestroy, OnInit, output, PLATFORM_ID, signal } from '@angular/core';
import { NumberData } from '../../find-number-game';
import { isPlatformBrowser } from '@angular/common';
import { Number } from '../number/number';

@Component({
  selector: 'app-game-table',
  imports: [Number],
  templateUrl: './game-table.html',
  styleUrl: './game-table.scss',
})
export class GameTable implements OnInit, OnDestroy, AfterViewInit {
 
  private readonly platformId = inject(PLATFORM_ID);

  screenWidth = signal(0);

  columns = computed(() => this.screenWidth() < 768 ? 5 : 10);

  numbers = signal<NumberData[]>(this.generateItems());

  currentNumber = signal<number>(0);

  onSelectNumber = output<number>();

  ready = false;

  @HostListener('window:resize')
  onResize() {
    if (isPlatformBrowser(this.platformId)) {
      this.screenWidth.set(window.innerWidth);
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.screenWidth.set(window.innerWidth);
    }
  }


  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.screenWidth.set(window.innerWidth);

      setTimeout(() => {
        this.ready = true;
      });
    }
  }


  ngOnDestroy(): void {
    this.currentNumber.set(0);
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


  protected shuffle() {
    this.numbers.set(this.generateItems());
  }


  public selectNumber() {
    this.currentNumber.update((number) => number + 1);
    console.log('selected on table: ', this.currentNumber())
    this.onSelectNumber.emit(this.currentNumber())
  }
}


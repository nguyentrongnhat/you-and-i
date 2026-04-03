import { isPlatformBrowser } from '@angular/common';
import { Component, computed, HostListener, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Number } from './components/number/number';

type GridItem = {
  value: number;
  rotate: number;
  tx: number;
  ty: number;
  scale: number;
  color: string;
  textColor: string;
  fontSize: number;
  zIndex: number;
  originX: number;
  originY: number;
};

@Component({
  selector: 'app-find-number-game',
  imports: [Number],
  templateUrl: './find-number-game.html',
  styleUrl: './find-number-game.scss',
})
export class FindNumberGame implements OnInit {

  private readonly platformId = inject(PLATFORM_ID);

  screenWidth = signal(0);

  columns = computed(() => this.screenWidth() < 768 ? 5 : 10);

  numbers = signal<GridItem[]>(this.generateItems());

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.screenWidth.set(window.innerWidth);
    }
  }

  // ✅ resize an toàn
  @HostListener('window:resize')
  onResize() {
    if (isPlatformBrowser(this.platformId)) {
      this.screenWidth.set(window.innerWidth);
    }
  }

  generateItems(): GridItem[] {
    const arr = Array.from({ length: 100 }, (_, i) => i + 1);

    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr.map(num => {
      const hue = this.random(0, 360);
      const lightness = this.random(40, 70);

      const bgColor = `hsl(${hue}, 80%, ${lightness}%)`;

      return {
        value: num,
        rotate: this.random(-120, 120),
        tx: this.random(-20, 20),
        ty: this.random(-50, 20),
        scale: this.random(0.8, 1.5),
        color: bgColor,
        textColor: '#000',
        fontSize: this.random(12, 22),
        zIndex: Math.floor(this.random(1, 50)),
        originX: this.random(0, 100),
        originY: this.random(0, 100),
      };
    });
  }

  random(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  shuffle() {
    this.numbers.set(this.generateItems());
  }
}

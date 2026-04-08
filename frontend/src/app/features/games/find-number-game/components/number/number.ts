import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, effect, ElementRef, inject, input, output, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { NumberData } from '../../find-number-game';

@Component({
  selector: 'app-number',
  imports: [CommonModule],
  templateUrl: './number.html',
  styleUrl: './number.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class Number implements AfterViewInit {

  @ViewChild('numberCanvas')
  protected canvasRef!: ElementRef<HTMLCanvasElement>;

  public data = input<NumberData>();

  public onSelected = output<number>();

  public currentNumber = input<number>(0);

  protected isIndicate = signal<boolean>(false);

  protected isSelected = signal<boolean>(false);

  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
      if (isPlatformBrowser(this.platformId)) {
        effect(() => {
          this.drawNumber(this.data() as NumberData);
          const currentNumber = this.currentNumber();
          this.updateForSelectedNumber(currentNumber);
          this.upDateIndicate(currentNumber);
        });
      }
  }


  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.drawNumber(this.data() as NumberData);
    }
  }


  protected getTransform() {
    return {
      left: this.data()?.tx + '%',
      top: this.data()?.ty + '%',
      transform: `translate(-50%, -50%) rotate(${this.data()?.rotate}deg)`
    };
  }


  protected onSelect() {
    const numberData: number = this.data()?.value ?? -1
    if(this.currentNumber() + 1 === numberData) {
      this.updateForSelectedNumber(this.currentNumber());
      this.onSelected.emit(numberData)
    }
  }


  protected updateForSelectedNumber(currentNumber: number) {
    const numberData: number = this.data()?.value ?? -1
    if(numberData <= currentNumber) {
      this.isSelected.set(true);
      console.log('set selected to false')
    }
  }


  protected upDateIndicate(currentNumber: number) {
    const numberData: number = this.data()?.value ?? -1
    this.isIndicate.set(currentNumber + 1 === numberData);
    console.log('set indicate equal true')
  }


  private drawNumber(drawData: NumberData) {
      if (!this.canvasRef?.nativeElement) return;

      const canvas = this.canvasRef.nativeElement;
      const ctx = canvas.getContext('2d');

      if(!ctx) return;

      const size = 45;
      canvas.width = size;
      canvas.height = size;
      ctx.clearRect(0, 0, size, size);

      ctx.fillStyle = 'black';
      ctx.font = `${drawData?.fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const value = drawData?.value ?? -1;

      ctx.fillText(
        value.toString(),
        size / 2,
        size / 2
      );
  }
}

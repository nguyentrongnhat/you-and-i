import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, input, output, signal, ViewChild } from '@angular/core';
import { PlatformService } from '../../../../../services/platform.service';
import { UserService } from '../../../../user-management/services/user.service';
import { ROLE } from '../../../../../core/enums';
import { NumberData } from '../../../../../core/type';
import { FindNumberGameService } from '../../services/findnumber.service';
import { SoundService } from '../../services/sound.service';

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

  private currentSelectedNumber = computed(() => this.findNumberGameService.currentSeclectedNumber());

  private targetNumber = computed(() => this.findNumberGameService.curentTargetNumber());

  protected isIndicate = signal<boolean>(false);

  protected isTarget = signal<boolean>(false);

  protected isSelected = signal<boolean>(false);

  private readonly userService = inject(UserService);

  private readonly platformService = inject(PlatformService);

  private readonly findNumberGameService = inject(FindNumberGameService);

  private readonly soundService = inject(SoundService);

  constructor() {
    effect(() => {
      const numberData = this.data() as NumberData;
      if (this.platformService.isBrowser()) {
        this.drawNumber(numberData);
        this.updateForSelectedNumber(this.currentSelectedNumber());
        this.upDateIndicate(this.currentSelectedNumber());
      }
    });
  }


  ngAfterViewInit(): void {
    if (this.platformService.isBrowser()) {
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
    const numberData: number = this.data()!.value
    if(this.targetNumber() === numberData) {
      this.findNumberGameService.currentSeclectedNumber.set(numberData);
      this.updateForSelectedNumber(this.currentSelectedNumber());
      this.soundService.playSound('correct');
    }
  }


  protected updateForSelectedNumber(currentNumber: number) {
    const numberData: number = this.data()!.value
    if(numberData <= currentNumber) {
      this.isSelected.set(true);
    }
  }


  protected upDateIndicate(currentNumber: number) {
    const numberData: number = this.data()!.value
    this.isTarget.set(currentNumber + 1 === numberData);
    if (!this.userService.hasRoles([ROLE.SUPER_ADMIN])) return;
    this.isIndicate.set(currentNumber + 1 === numberData);
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

      const textColor = getComputedStyle(canvas).color || '#111827';
      ctx.fillStyle = textColor;
      ctx.font = `600 ${drawData?.fontSize}px Inter, Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const value = drawData?.value;

      ctx.fillText(
        value.toString(),
        size / 2,
        size / 2
      );
  }
}

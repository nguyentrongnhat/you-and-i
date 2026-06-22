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

  private readonly userService = inject(UserService);

  private readonly platformService = inject(PlatformService);

  private readonly findNumberGameService = inject(FindNumberGameService);

  private readonly soundService = inject(SoundService);

  private currentSelectedNumber = computed(() => this.findNumberGameService.currentSeclectedNumber());

  private targetNumber = computed(() => this.findNumberGameService.curentTargetNumber());

  protected isTargetNumber = computed<boolean>(() => this.targetNumber() === this.data()?.value);

  protected isSelected = computed<boolean>(() => {
    const numberData: number = this.data()?.value || 0;
    return numberData <= this.currentSelectedNumber();
  });

  protected isIndicate = computed<boolean>(() => {
    const numberData: number = this.data()?.value || 0;
    if (!this.userService.hasRoles([ROLE.SUPER_ADMIN])) return false;
    return numberData === this.targetNumber();
  });

  constructor() {
    if (this.data()) {
      this.drawNumber(this.data() as NumberData);
    }
    
    effect(() => {
      const numberData = this.data() as NumberData;
      if (this.platformService.isBrowser()) {
        this.drawNumber(numberData);
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
      this.soundService.playSound('correct');
    }
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

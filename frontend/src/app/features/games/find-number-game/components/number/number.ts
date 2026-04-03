import { CommonModule } from '@angular/common';
import { Component, input, signal } from '@angular/core';

type NumberData = {
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
  selector: 'app-number',
  imports: [CommonModule],
  templateUrl: './number.html',
  styleUrl: './number.scss',
})

export class Number {
  data = input<NumberData | undefined>(undefined);

  isSelected = signal<boolean>(false);

  selected(num: number | undefined) {
    this.isSelected.set(true);
  }
}

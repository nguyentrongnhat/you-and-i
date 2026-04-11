import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameTable } from './game-table';

describe('GameTable', () => {
  let component: GameTable;
  let fixture: ComponentFixture<GameTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameTable],
    }).compileComponents();

    fixture = TestBed.createComponent(GameTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

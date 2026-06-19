import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameRanking } from './game-ranking';

describe('GameRanking', () => {
  let component: GameRanking;
  let fixture: ComponentFixture<GameRanking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameRanking],
    }).compileComponents();

    fixture = TestBed.createComponent(GameRanking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameResultScreen } from './game-result-screen';

describe('GameResultScreen', () => {
  let component: GameResultScreen;
  let fixture: ComponentFixture<GameResultScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameResultScreen],
    }).compileComponents();

    fixture = TestBed.createComponent(GameResultScreen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamePlayScreen } from './game-play-screen';

describe('GamePlayScreen', () => {
  let component: GamePlayScreen;
  let fixture: ComponentFixture<GamePlayScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GamePlayScreen],
    }).compileComponents();

    fixture = TestBed.createComponent(GamePlayScreen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

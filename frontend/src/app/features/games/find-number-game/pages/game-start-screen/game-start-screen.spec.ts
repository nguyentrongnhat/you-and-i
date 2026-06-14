import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameStartScreen } from './game-start-screen';

describe('GameStartScreen', () => {
  let component: GameStartScreen;
  let fixture: ComponentFixture<GameStartScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameStartScreen],
    }).compileComponents();

    fixture = TestBed.createComponent(GameStartScreen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

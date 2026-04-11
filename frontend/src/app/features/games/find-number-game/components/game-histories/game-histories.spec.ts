import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameHistories } from './game-histories';

describe('GameHistories', () => {
  let component: GameHistories;
  let fixture: ComponentFixture<GameHistories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameHistories],
    }).compileComponents();

    fixture = TestBed.createComponent(GameHistories);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

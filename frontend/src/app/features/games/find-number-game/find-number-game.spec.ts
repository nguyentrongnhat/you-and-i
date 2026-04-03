import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindNumberGame } from './find-number-game';

describe('FindNumberGame', () => {
  let component: FindNumberGame;
  let fixture: ComponentFixture<FindNumberGame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FindNumberGame],
    }).compileComponents();

    fixture = TestBed.createComponent(FindNumberGame);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

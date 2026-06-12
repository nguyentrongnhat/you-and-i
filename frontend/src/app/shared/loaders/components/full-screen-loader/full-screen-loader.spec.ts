import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullScreenLoader } from './full-screen-loader';

describe('FullScreenLoader', () => {
  let component: FullScreenLoader;
  let fixture: ComponentFixture<FullScreenLoader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullScreenLoader],
    }).compileComponents();

    fixture = TestBed.createComponent(FullScreenLoader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

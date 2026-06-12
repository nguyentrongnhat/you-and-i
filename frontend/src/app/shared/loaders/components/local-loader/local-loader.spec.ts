import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalLoader } from './local-loader';

describe('LocalLoader', () => {
  let component: LocalLoader;
  let fixture: ComponentFixture<LocalLoader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocalLoader],
    }).compileComponents();

    fixture = TestBed.createComponent(LocalLoader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Layout3 } from './layout3';

describe('Layout3', () => {
  let component: Layout3;
  let fixture: ComponentFixture<Layout3>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Layout3]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Layout3);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

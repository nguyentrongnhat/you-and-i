import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Layout1 } from './layout1';

describe('Layout1', () => {
  let component: Layout1;
  let fixture: ComponentFixture<Layout1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Layout1]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Layout1);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Layout2 } from './layout2';

describe('Layout2', () => {
  let component: Layout2;
  let fixture: ComponentFixture<Layout2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Layout2]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Layout2);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

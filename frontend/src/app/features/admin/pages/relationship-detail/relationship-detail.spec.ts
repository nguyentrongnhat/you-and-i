import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelationshipDetail } from './relationship-detail';

describe('RelationshipDetail', () => {
  let component: RelationshipDetail;
  let fixture: ComponentFixture<RelationshipDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelationshipDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(RelationshipDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

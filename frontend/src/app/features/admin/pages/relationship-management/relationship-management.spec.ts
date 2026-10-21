import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelationshipManagement } from './relationship-management';

describe('RelationshipManagement', () => {
  let component: RelationshipManagement;
  let fixture: ComponentFixture<RelationshipManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelationshipManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(RelationshipManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowFestival } from './workflow-festival';

describe('WorkflowFestival', () => {
  let component: WorkflowFestival;
  let fixture: ComponentFixture<WorkflowFestival>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowFestival]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowFestival);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

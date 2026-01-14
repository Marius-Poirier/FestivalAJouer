import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowJeux } from './workflow-jeux';

describe('WorkflowJeux', () => {
  let component: WorkflowJeux;
  let fixture: ComponentFixture<WorkflowJeux>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowJeux]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowJeux);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

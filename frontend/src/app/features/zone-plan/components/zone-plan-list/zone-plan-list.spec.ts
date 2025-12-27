import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZonePlanList } from './zone-plan-list';

describe('ZonePlanList', () => {
  let component: ZonePlanList;
  let fixture: ComponentFixture<ZonePlanList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZonePlanList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZonePlanList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

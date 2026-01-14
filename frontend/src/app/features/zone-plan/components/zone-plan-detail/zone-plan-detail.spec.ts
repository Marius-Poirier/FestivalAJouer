import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZonePlanDetail } from './zone-plan-detail';

describe('ZonePlanDetail', () => {
  let component: ZonePlanDetail;
  let fixture: ComponentFixture<ZonePlanDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZonePlanDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZonePlanDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationInfo } from './reservation-info';

describe('ReservationInfo', () => {
  let component: ReservationInfo;
  let fixture: ComponentFixture<ReservationInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTableReservation } from './add-table-reservation';

describe('AddTableReservation', () => {
  let component: AddTableReservation;
  let fixture: ComponentFixture<AddTableReservation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTableReservation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTableReservation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

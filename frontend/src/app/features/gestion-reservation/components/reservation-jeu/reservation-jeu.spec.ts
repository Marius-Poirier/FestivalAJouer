import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationJeu } from './reservation-jeu';

describe('ReservationJeu', () => {
  let component: ReservationJeu;
  let fixture: ComponentFixture<ReservationJeu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationJeu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationJeu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

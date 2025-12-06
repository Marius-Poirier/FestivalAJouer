import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoneTarifaireCard } from './zone-tarifaire-card';

describe('ZoneTarifaireCard', () => {
  let component: ZoneTarifaireCard;
  let fixture: ComponentFixture<ZoneTarifaireCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZoneTarifaireCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZoneTarifaireCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

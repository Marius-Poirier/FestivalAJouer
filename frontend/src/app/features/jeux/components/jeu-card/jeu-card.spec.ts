import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JeuCard } from './jeu-card';

describe('JeuCard', () => {
  let component: JeuCard;
  let fixture: ComponentFixture<JeuCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JeuCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JeuCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

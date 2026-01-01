import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JeuDetail } from './jeu-detail';

describe('JeuDetail', () => {
  let component: JeuDetail;
  let fixture: ComponentFixture<JeuDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JeuDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JeuDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

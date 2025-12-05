import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FestivalSelector } from './festival-selector';

describe('FestivalSelector', () => {
  let component: FestivalSelector;
  let fixture: ComponentFixture<FestivalSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FestivalSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FestivalSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

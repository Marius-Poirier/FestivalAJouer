import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupDelete } from './popup-delete';

describe('PopupDelete', () => {
  let component: PopupDelete;
  let fixture: ComponentFixture<PopupDelete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupDelete]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupDelete);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditeurListFestival } from './editeur-list-festival';

describe('EditeurListFestival', () => {
  let component: EditeurListFestival;
  let fixture: ComponentFixture<EditeurListFestival>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditeurListFestival]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditeurListFestival);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

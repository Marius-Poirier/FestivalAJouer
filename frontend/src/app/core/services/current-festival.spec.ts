import { TestBed } from '@angular/core/testing';

import { CurrentFestival } from './current-festival';

describe('CurrentFestival', () => {
  let service: CurrentFestival;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurrentFestival);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

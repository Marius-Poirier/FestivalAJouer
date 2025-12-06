import { TestBed } from '@angular/core/testing';

import { ZoneTarifaireService } from './zone-tarifaire-service';

describe('ZoneTarifaireService', () => {
  let service: ZoneTarifaireService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ZoneTarifaireService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

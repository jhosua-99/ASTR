import { TestBed } from '@angular/core/testing';

import { PolizaService } from './poliza.service';

describe('PolizaService', () => {
  let service: PolizaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PolizaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

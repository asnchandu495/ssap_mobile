import { TestBed } from '@angular/core/testing';

import { PinmicroService } from './pinmicro.service';

describe('PinmicroService', () => {
  let service: PinmicroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PinmicroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

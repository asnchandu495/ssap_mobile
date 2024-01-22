import { TestBed } from '@angular/core/testing';

import { IbeaconService } from './ibeacon.service';

describe('IbeaconService', () => {
  let service: IbeaconService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IbeaconService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

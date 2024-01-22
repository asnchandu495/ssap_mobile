import { TestBed } from '@angular/core/testing';

import { GeofencingService } from './geofencing.service';

describe('GeofencingService', () => {
  let service: GeofencingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeofencingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

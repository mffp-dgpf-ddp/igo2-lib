import { TestBed } from '@angular/core/testing';

import { MapImageService } from './map-image.service';

describe('MapImageService', () => {
  let service: MapImageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

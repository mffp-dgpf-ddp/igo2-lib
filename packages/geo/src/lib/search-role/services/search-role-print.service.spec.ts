import { TestBed } from '@angular/core/testing';

import { SearchRolePrintService } from './search-role-print.service';

describe('SearchRolePrintService', () => {
  let service: SearchRolePrintService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchRolePrintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

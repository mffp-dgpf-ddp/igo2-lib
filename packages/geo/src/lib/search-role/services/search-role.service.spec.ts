import { TestBed } from '@angular/core/testing';

import { SearchRoleService } from './search-role.service';

describe('SearchRoleService', () => {
  let service: SearchRoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchRoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

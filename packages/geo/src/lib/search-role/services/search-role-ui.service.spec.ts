import { TestBed } from '@angular/core/testing';

import { SearchRoleUiService } from './search-role-ui.service';

describe('SearchRoleUiService', () => {
  let service: SearchRoleUiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchRoleUiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchRoleResultsComponent } from './search-role-results.component';

describe('SearchRoleResultsComponent', () => {
  let component: SearchRoleResultsComponent;
  let fixture: ComponentFixture<SearchRoleResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchRoleResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchRoleResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

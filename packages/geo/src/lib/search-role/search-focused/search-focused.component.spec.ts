import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFocusedComponent } from './search-focused.component';

describe('SearchFocusedComponent', () => {
  let component: SearchFocusedComponent;
  let fixture: ComponentFixture<SearchFocusedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchFocusedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFocusedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

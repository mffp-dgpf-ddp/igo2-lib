import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchLayerResultsComponent } from './search-layer-results.component';

describe('SearchLayerResultsComponent', () => {
  let component: SearchLayerResultsComponent;
  let fixture: ComponentFixture<SearchLayerResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchLayerResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchLayerResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { Component, OnInit, Input } from '@angular/core';
import { SearchFocusedComponent } from '../search-focused/search-focused.component'
import { SearchRoleUiService } from '../services/search-role-ui.service'

@Component({
  selector: 'igo-search-role-results',
  templateUrl: './search-role-results.component.html',
  styleUrls: ['./search-role-results.component.scss']
})
export class SearchRoleResultsComponent implements OnInit {

  @Input() searchResults: any;
  @Input() client: any;

  public title: String = "Role Evaluation";

  constructor(
    private searchRoleUiService:SearchRoleUiService) { }

  ngOnInit(): void {
    
  }

  public lastPage(){
    this.searchRoleUiService.closeModal()
  }

  public hideSearch(){
    this.searchRoleUiService.dissmissModals()
  }

  async focusResults(newFocusedResult){
    this.showResults(newFocusedResult)
  }

  public showResults(firstSearchResults : any){
    this.searchRoleUiService.showSearchResults(SearchFocusedComponent, firstSearchResults)
  }
}

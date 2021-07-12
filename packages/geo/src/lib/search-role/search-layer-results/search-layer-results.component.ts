import { Component, OnInit, Input } from '@angular/core';
import { SearchFocusedComponent } from '../search-focused/search-focused.component'
import { SearchRoleUiService } from '../services/search-role-ui.service'
import { SearchRoleService } from '../services/search-role.service'
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms'

@Component({
  selector: 'igo-search-layer-results',
  templateUrl: './search-layer-results.component.html',
  styleUrls: ['./search-layer-results.component.scss']
})
export class SearchLayerResultsComponent implements OnInit {

  @Input() searchResults: any;
  @Input() client: any;

  public title: String = "Role Evaluation";

  constructor(
    private searchRoleUiService:SearchRoleUiService,
    private searchRoleService: SearchRoleService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    
  }

  public lastPage(){
    this.searchRoleUiService.closeModal()
  }

  public hideSearch(){
    this.searchRoleUiService.dissmissModals()
  }

  public focusResults(newFocusedResult : any){
    const searchFields = { 'criteria1' : 'id_provinc' }
    const searchForm = this.formBuilder.group({
      'criteria1': [newFocusedResult['properties']['id_provinc'], Validators.required]
    })
    this.searchRoleService.searchTableAndPresent('Role', searchFields, searchForm, SearchFocusedComponent)
  }
}

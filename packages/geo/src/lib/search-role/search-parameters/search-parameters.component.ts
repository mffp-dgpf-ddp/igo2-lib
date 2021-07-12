import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms'
import * as labelListTemp from '../assets/search-layer.json';
import { SearchLayerResultsComponent } from '../search-layer-results/search-layer-results.component'
import { SearchRoleResultsComponent } from '../search-role-results/search-role-results.component'
import { SearchRoleUiService } from '../services/search-role-ui.service'
import { SearchRoleService } from '../services/search-role.service'

@Component({
  selector: 'igo-search-parameters',
  templateUrl: './search-parameters.component.html',
  styleUrls: ['./search-parameters.component.scss']
})
export class SearchParametersComponent implements OnInit {

  @Input() searchResults: any;
  @Input() client: any;

  public labelList : any;
  public searchForm : FormGroup;
  public searchFields : any;
  public searchFormProprio: FormGroup;
  public searchFieldsProprio;
  public searchFormRole: FormGroup;
  public searchFieldsRole : any;
  public title: String = "Role Evaluation";
  private criteriaCount : number;
  private criteriaCountProprio: number=2;
  private criteriaCountRole: number=1;
  private searchableFields : any;
  private searchableFieldsProprio : any;
  private searchableFieldsRole : any = ['noLot'];
  private loading: HTMLIonLoadingElement;
  public searchType: string = "PROPRIO";

  constructor(private formBuilder: FormBuilder,
    private searchRoleUiService:SearchRoleUiService,
    private searchRoleService: SearchRoleService) { 
    this.searchFormProprio = formBuilder.group({
      'criteria1': ['', Validators.required],
      'criteria2': ['', Validators.required]
    })
    this.searchFormRole = formBuilder.group({
      'criteria1': ['', Validators.required]
    })
  }

  ngOnInit(): void {
    this.searchableFieldsProprio = this.searchResults;
    this.searchFieldsProprio = {
      'criteria1': 'Nom',
      'criteria2': 'Prenom'
    }
    this.searchFieldsRole = {
      'criteria1': this.searchableFieldsRole[0]
    }
    var index = this.searchableFieldsProprio.indexOf('Nom', 0)
    this.searchableFieldsProprio.splice(index,1)
    index = this.searchableFieldsProprio.indexOf('Prenom', 0)
    this.searchableFieldsProprio.splice(index,1)
    this.searchableFieldsRole.splice(0,1)
    this.labelList = labelListTemp;
    this.searchForm = this.searchFormProprio
    this.searchFields = this.searchFieldsProprio
    this.searchableFields = this.searchableFieldsProprio
    this.criteriaCount = this.criteriaCountProprio
  }

  public setSearchProprio(){
    if (this.searchType==="Role"){
      this.searchFormRole = this.searchForm
      this.searchForm = this.searchFormProprio
      this.searchFieldsRole = this.searchFields
      this.searchFields = this.searchFieldsProprio
      this.searchableFields = this.searchableFieldsProprio
      this.criteriaCountRole = this.criteriaCount
      this.criteriaCount = this.criteriaCountProprio
      this.searchType = "PROPRIO"
    }
  }

  public setSearchRole(){
    if (this.searchType==="PROPRIO"){
      this.searchFormProprio = this.searchForm
      this.searchForm = this.searchFormRole
      this.searchFieldsProprio = this.searchFields
      this.searchFields = this.searchFieldsRole
      this.searchableFields = this.searchableFieldsRole
      this.criteriaCountProprio = this.criteriaCount
      this.criteriaCount = this.criteriaCountRole
      this.searchType = "Role"
    }
  }

  public getSearchFields(){
    return this.searchableFields;
  }

  public addSearchField(){
      this.criteriaCount++;
      this.searchForm.addControl('criteria' + this.criteriaCount, new FormControl('', Validators.required));
      this.searchFields["criteria" + this.criteriaCount] = this.getSearchFields()[0];
      this.searchableFields.splice(0,1)
  }

  public removeSearchField(control : any){
      this.searchableFields.push(this.searchFields[control.key])
      this.searchForm.removeControl(control.key);
      delete this.searchFields[control.key];
  }

  public setSearchField($event, control : any){
    if ($event.target.value){
        this.searchableFields.push(this.searchFields[control.key])
        this.searchFields[control.key] = $event.target.value;
        const index = this.searchableFields.indexOf($event.target.value)
        this.searchableFields.splice(index,1)
    }
  }

  public getValue(controlKey : string){
    return this.searchFields[controlKey];
  }

  public maxCriterias(){
    return this.getSearchFields().length <= 0
  }

  public lastPage(){
    this.searchRoleUiService.closeModal()
  }

  public hideSearch(){
    this.searchRoleUiService.dissmissModals()
  }

  public fillType(buttonName : string){
    if (buttonName===this.searchType){
      return 'solid'
    }
    return 'outline'
  }

  public searchLayer(){
    if (this.searchRoleService.verifySearch(this.searchFields, this.searchForm)){
      if (this.searchType==='PROPRIO'){
        this.searchRoleService.searchTableAndPresent('PROPRIO', this.searchFields, this.searchForm, SearchLayerResultsComponent)
      }
      else {
        this.searchRoleService.searchTableAndPresent('Role', this.searchFields, this.searchForm, SearchRoleResultsComponent)
      }
    }
    else {
      this.searchRoleService.presentAlert('Erreur', '', 'Veuillez ajouter des critères de recherche')
    }
  }
}

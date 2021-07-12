import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import {IonicModule} from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav'
import { IgoMapModule } from '../map/map.module'

import { SearchParametersComponent } from './search-parameters/search-parameters.component';
import { SearchLayerResultsComponent } from './search-layer-results/search-layer-results.component';
import { SearchFocusedComponent } from './search-focused/search-focused.component';
import { SearchRoleResultsComponent } from './search-role-results/search-role-results.component'

import { SearchRoleService } from './services/search-role.service'

import { RoleEnvironment } from './roleEnvironment'

@NgModule({
  declarations: [
    SearchParametersComponent,
    SearchLayerResultsComponent,
    SearchFocusedComponent,
    SearchRoleResultsComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    MatIconModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSidenavModule,
    IgoMapModule
  ],
  exports: [
    SearchLayerResultsComponent,
    SearchFocusedComponent
  ],
  providers: [
    SearchRoleService
  ]
})
export class SearchRoleModule { 
  static forRoot(roleEnvironment: RoleEnvironment): ModuleWithProviders<any> {
    return {
      ngModule: SearchRoleModule,
      providers: [
        SearchRoleService,
        { provide: RoleEnvironment, useValue: roleEnvironment }
      ]
    };
  }
}
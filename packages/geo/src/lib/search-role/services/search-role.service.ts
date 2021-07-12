import { Component, ComponentRef, Injectable } from '@angular/core';
import { TokenService } from '@igo2/auth';
import { SearchRoleUiService } from '../services/search-role-ui.service'
import { AlertController, LoadingController } from '@ionic/angular';
import { RoleEnvironment } from '../roleEnvironment'


@Injectable({
  providedIn: 'root'
})
export class SearchRoleService {
  private roleUrl: string;
  private roleEnvironment: RoleEnvironment;
  private loading: HTMLIonLoadingElement;

  constructor(
    roleEnvironment: RoleEnvironment,
    private tokenService: TokenService,
    private searchRoleUiService:SearchRoleUiService,
    private loadingController: LoadingController,
    private alertController:AlertController,
    ) { 
      this.roleEnvironment = roleEnvironment
      this.roleUrl = this.roleEnvironment.gatewayUrl
    }

  public async searchTableAndPresent(table : string, searchFields : any, searchForm : any, component : any){
    await this.showLoading()
    this.searchTable(table, searchFields, searchForm).then(
      (value) => {
        this.dismissLoading()
        if (value['features'].length!==0){
          this.showResults(component, value['features'])
        }
        else {
          this.presentAlert('Aucun résultat trouvé', '', 'Veuillez affiner votre recherche')
        }
      },
      (value) => {
        this.dismissLoading()
        this.presentAlert('Erreur', '', value)
      })
    }

  public searchTable(table : string, searchFields : any, searchForm : any){
    const body = this.requestBody(table, searchFields, searchForm)
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const token = this.tokenService.getAuthToken();
      if (table==="PROPRIO"){
        var url = this.roleUrl + '/PROPRIO'
      }
      else{
        var url = this.roleUrl + '/Role'
      }
      url += '/ows?SERVICE=WFS&REQUEST=GetFeature'
      xhr.open('POST', url)
      xhr.setRequestHeader('Authorization',`Bearer ${token}`);
      
      xhr.onerror = function() {
        reject("Une erreur s'est produite avec la requête.")
      }
      xhr.onreadystatechange = function(){
        if(xhr.readyState===XMLHttpRequest.DONE){

          var status = xhr.status;
          if(status===0 || (status >= 200 && status < 400)){
            resolve(JSON.parse(xhr.response))
          }
          else{
            reject("Une erreur s'est produite. Veuillez vérifier votre connexion et réessayer.");
          }
        }
      }
      xhr.send(body);
    })
  }

  public showResults(component : any, firstSearchResults : any){
    this.searchRoleUiService.showSearchResults(component, firstSearchResults)
  }


  public async presentAlert(header: string, subHeader: string, msg: string) {
    const alert = await this.alertController.create({
      header,
      subHeader,
      message: msg,
      buttons: [
        {
          text: 'Ok',
        }
      ]
    });
    await alert.present();
  }

  private async showLoading() {
    this.loading = await this.loadingController.create({
      message: 'Recherche en cours, veuillez patienter svp...'
    });
    await this.loading.present();
  }

  private dismissLoading() {
    if (this.loading) {
      this.loading.dismiss();
      this.loading = null;
    }
  }

  private prepareQueryInputs(property : string, propertyValue : any){
    if (property==="mat18" && propertyValue.length<18){
      propertyValue += '0'.repeat(18-propertyValue.length)
    }
    return this.remove_accents(propertyValue.toUpperCase())
  }

  private remove_accents(str : string){
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }

  private requestBody(table : String, searchFields : any, searchForm : any){
    var body = '';
    if (table==="PROPRIO"){
      body += `<wfs:GetFeature service="WFS" version="1.0.0"
      outputFormat="JSON"
      xmlns:wfs="http://www.opengis.net/wfs"
      xmlns:ogc="http://www.opengis.net/ogc"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.opengis.net/wfs
                          http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd">
      <wfs:Query typeName="RoleEvaluation:PROPRIO">
        <ogc:Filter>
            <And>`
    }
    else{
      body += `<wfs:GetFeature service="WFS" version="1.0.0"
      outputFormat="JSON"
      xmlns:wfs="http://www.opengis.net/wfs"
      xmlns:ogc="http://www.opengis.net/ogc"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.opengis.net/wfs
                          http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd">
      <wfs:Query typeName="RoleEvaluation:Role">
        <ogc:Filter>
            <And>`
    }
    
    for (let key in searchFields){
      if(searchFields[key]==="Ville"){
        body+= `<ogc:PropertyIsLike wildCard="%" singleChar="_" escape="!">
          <ogc:PropertyName>${searchFields[key]}</ogc:PropertyName>
          <ogc:Literal>%${this.prepareQueryInputs(searchFields[key],searchForm["value"][key])}%</ogc:Literal>
        </ogc:PropertyIsLike>`
      }
      else{
      body+= `<ogc:PropertyIsEqualTo>
               <ogc:PropertyName>${searchFields[key]}</ogc:PropertyName>
            <ogc:Literal>${this.prepareQueryInputs(searchFields[key],searchForm["value"][key])}</ogc:Literal>
          </ogc:PropertyIsEqualTo>`
      }
    }
          
    body += `</And>
          </ogc:Filter>
          </wfs:Query>
        </wfs:GetFeature>`
    return body
  }

  public verifySearch(searchFields: any, searchForm: any){
    const fields = Object.values(searchFields)
    if (fields.length < 1){
      return false
    }
    if (fields.length === 1) {
      if (fields[0] === 'Nom' || fields[0] === 'Prenom'|| fields[0] === 'Ville'){
        return false
      }
    }
    if (fields.length === 2){
      if ((fields[0]==="Ville" || fields[1]==='Ville') && !(fields[0]==='mat18' || fields[1]==='mat18')){
        return false
      }
    }
    return true
  }

}

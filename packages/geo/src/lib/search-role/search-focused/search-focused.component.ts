import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import * as labelListTemp from '../assets/search-layer.json';
import { IgoMap } from '../../map';
import { DataSourceService } from '../../datasource/shared/datasource.service'
import { LayerService } from '../../layer/shared/layer.service'
import { Router } from '@angular/router';
import { MapService } from '../../map/shared/map.service';
import { moveToOlFeatures } from '../../feature/shared/feature.utils';
import { FeatureLayerService } from '@mffp.dgpf.ddp.techno/igo2'
import { SearchRoleUiService } from '../services/search-role-ui.service'
import { SearchRolePrintService } from '../services/search-role-print.service'
import { MapImageService } from "../services/map-image.service"
import { FeatureMotion } from '../../feature/shared'

@Component({
  selector: 'igo-search-focused',
  templateUrl: './search-focused.component.html',
  styleUrls: ['./search-focused.component.scss']
})
export class SearchFocusedComponent implements OnInit, OnChanges {

  @Input() searchResults: any;
  @Input() client: any;
  
  public labelList : any;
  public title: String = "Role Evaluation";
  private loading: HTMLIonLoadingElement;
  public RoleResults : any;

  map = new IgoMap({
    controls: {
      scaleLine: true,
      attribution: {
        collapsed: true
      }
    }
  });

  public view = {
    center: [-73, 47.2],
    zoom: 15
  };

  constructor(
    public layerService: LayerService,
    public dataSourceService: DataSourceService,
    private router: Router,
    private mapService: MapService,
    private featureLayerService: FeatureLayerService,
    private searchRoleUiService:SearchRoleUiService,
    private searchRolePrintService:SearchRolePrintService,
    private mapImageService:MapImageService,
    private loadingController: LoadingController) {

    this.dataSourceService
      .createAsyncDataSource({
        type: 'osm'
      })
      .subscribe(dataSource => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'OSM',
            source: dataSource
          })
        );
      });
   }

  ngOnInit(): void {
    if (this.searchResults[0]){
      this.RoleResults = this.searchResults[0];
    }
    else{
      this.RoleResults = this.searchResults;
    }
    this.labelList = labelListTemp;
    this.view.center = this.RoleResults.geometry.coordinates
    this.addFeature(this.RoleResults)
    this.mapImageService.setMap(this.map);
  }

  updateMap() {
    setTimeout(() => {
      this.map.ol.updateSize();
      this.view.zoom = 4;
    }, 600);
  }

  ngOnChanges() {
    this.updateMap()
  }

  addFeature(feature: any) {

    setTimeout(() => {
      this.map.overlay.clear();
      this.map.overlay.setFeatures([feature], FeatureMotion.Default);
      this.map.setView({ center: this.RoleResults.geometry.coordinates, zoom: this.view.zoom });
      this.mapImageService.setMap(this.map);
      this.updateMap();
    }, 1000);
  }

  public openRapportInMap(){
    this.router.navigate(['/igo']);
    const features = this.featureLayerService.geojsonToFeature([this.RoleResults]);
    this.featureLayerService.addFeaturesOnNewClusterMapLayer(features, 'roleevaluation', 'RoleEvaluation');
    moveToOlFeatures(this.mapService.getMap(), features);
    this.searchRoleUiService.dissmissModals()
  }

  public async exportToPDF(){
    await this.showLoading()
    this.searchRolePrintService.exportRoleResultToPdf(this.RoleResults['properties'], this.RoleResults.geometry.coordinates, this.mapImageService.getMap()).then(
      () => {
        this.dismissLoading();
      },
      () => {
        this.dismissLoading();
      }
    );
  }

  public formatKey(key : string){
    if(this.RoleResults['properties'][key]){
      return this.labelList['databaseToScreen'][key] + " : " + this.RoleResults['properties'][key]
    }
    return this.labelList['databaseToScreen'][key] + " : Valeur absente"
  }

  public lastPage(){
    this.searchRoleUiService.closeModal()
  }

  public hideSearch(){
    this.searchRoleUiService.dissmissModals();
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
}

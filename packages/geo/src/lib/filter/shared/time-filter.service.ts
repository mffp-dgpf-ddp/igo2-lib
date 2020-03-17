import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { WMSDataSource } from '../../datasource/shared/datasources/wms-datasource';
import { TileArcGISRestDataSource } from '../../datasource/shared/datasources/tilearcgisrest-datasource';
import { OgcFilterWriter } from './ogc-filter';
import { OgcInterfaceFilterOptions, OgcFiltersOptions } from './ogc-filter.interface';
import { WFSDataSourceOptionsParams } from '../../datasource/shared/datasources/wfs-datasource.interface';

@Injectable()
export class TimeFilterService {

  public ogcFilterWriter = new OgcFilterWriter();

  constructor() {}

  filterByDate(
    datasource: WMSDataSource | TileArcGISRestDataSource,
    date: Date | [Date, Date]
  ) {
    let time;
    let newdateform;
    let newdateformStart;
    let newdateformEnd;

    if (Array.isArray(date)) {
      const dates = [];
      if (date[0]) {
        newdateformStart = this.reformatDateTime(date[0]);
        dates.push(date[0]);
      }
      if (date[1]) {
        newdateformEnd = this.reformatDateTime(date[1]);
        dates.push(date[1]);
      }
      if (dates.length === 2 && newdateformStart !== newdateformEnd) {
        if (datasource instanceof TileArcGISRestDataSource) {
          time = newdateformStart + ',' + newdateformEnd;
        } else {
          time = newdateformStart + '/' + newdateformEnd;
          this.addDuringFilterToSequence(datasource, 'date_wmst', newdateformStart, newdateformEnd);
        }
      }
      if (newdateformStart === newdateformEnd) {
        time = newdateformStart;
      }
    } else if (date) {
      newdateform = this.reformatDateTime(date);
      time = newdateform;
      this.addDuringFilterToSequence(datasource, 'date_wmst', newdateform, newdateform);
    }

    // const params = { TIME: time };
    this.refreshFilters(datasource);
    // datasource.ol.updateParams(params);
  }

  filterByYear(
    datasource: WMSDataSource | TileArcGISRestDataSource,
    year: string | [string, string]
  ) {
    console.log('la', datasource);
    let time;
    let newdateformStart;
    let newdateformEnd;

    if (Array.isArray(year)) {
      const years = [];
      if (year[0]) {
        newdateformStart = year[0];
        years.push(year[0]);
      }
      if (year[1]) {
        newdateformEnd = year[1];
        years.push(year[1]);
      }
      if (years.length === 2 && newdateformStart !== newdateformEnd) {
        if (datasource instanceof TileArcGISRestDataSource) {
          time = newdateformStart + ',' + newdateformEnd;
        } else {
          time = newdateformStart + '/' + newdateformEnd;
          this.addDuringFilterToSequence(datasource, 'date_wmst', newdateformStart, newdateformEnd);
        }
      }
      if (newdateformStart === newdateformEnd) {
        time = newdateformStart;
      }
    } else {  // to reset filter.
      time = year;
    }

    const params = { TIME: time };
    datasource.ol.updateParams(params);
  }

  private reformatDateTime(value) {
    const year = value.getFullYear();
    let month = value.getMonth() + 1;
    let day = value.getUTCDate();
    let hour = value.getUTCHours();
    let minute = value.getUTCMinutes();

    if (Number(month) < 10) {
      month = '0' + month;
    }

    if (Number(day) < 10) {
      day = '0' + day;
    }

    if (Number(hour) < 10) {
      hour = '0' + hour;
    }

    if (Number(minute) < 10) {
      minute = '0' + minute;
    }

    return year + '-' + month + '-' + day + 'T' + hour + ':' + minute + ':00Z';
  }

  addDuringFilterToSequence(ds, fn, begin, end) {
    const filterid = 'wms-t';
    const interfaceOgcFilters: OgcInterfaceFilterOptions[] = ds.options.ogcFilters.interfaceOgcFilters;
    let arr = interfaceOgcFilters || [];
    arr = arr.filter(f => f !== filterid);
    const lastLevel = arr.length === 0 ? 0 : arr[arr.length - 1].level;

    arr.push(
      this.ogcFilterWriter.addInterfaceFilter(
        {
          filterid,
          propertyName: fn,
          operator: 'During',
          begin,
          end,
          active: true,
        } as OgcInterfaceFilterOptions,
        undefined,
        lastLevel,
        'And'
      )
    );
    console.log('arr-During', arr);
    ds.options.ogcFilters.interfaceOgcFilters = arr;
  }

  refreshFilters(ds) {
    const ogcFilters: OgcFiltersOptions = ds.options.ogcFilters;

    const activeFilters = ogcFilters.interfaceOgcFilters.filter(
      f => f.active === true
    );
    if (activeFilters.length === 0) {
      ogcFilters.filters = undefined;
      ogcFilters.filtered = false;
    }
    if (activeFilters.length > 1) {
      activeFilters[0].parentLogical = activeFilters[1].parentLogical;
    }

    if (ogcFilters.enabled) {
      let rebuildFilter = '';
      if (activeFilters.length >= 1) {
        const ogcDataSource: any = ds;
        const ogcLayer: OgcFiltersOptions = ogcDataSource.options.ogcFilters;
        ogcLayer.filters = this.ogcFilterWriter.rebuiltIgoOgcFilterObjectFromSequence(
          activeFilters
        );
        rebuildFilter = this.ogcFilterWriter.buildFilter(
          ogcLayer.filters,
          undefined,
          undefined,
          (ds.options as any).fieldNameGeometry
        );
      }

      const appliedFilter = this.ogcFilterWriter.formatProcessedOgcFilter(rebuildFilter, ds.options.params.LAYERS);
      ds.ol.updateParams({ FILTER: appliedFilter });

      ds.options.ogcFilters.filtered =
        activeFilters.length === 0 ? false : true;
    }
  }

}

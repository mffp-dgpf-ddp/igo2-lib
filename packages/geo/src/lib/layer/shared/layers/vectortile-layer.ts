import olLayerVectorTile from 'ol/layer/VectorTile';
import olSourceVectorTile from 'ol/source/VectorTile';

import { MVTDataSource } from '../../../datasource/shared/datasources/mvt-datasource';

import { Layer } from './layer';
import { VectorTileLayerOptions } from './vectortile-layer.interface';
import { TileWatcher } from '../../utils';
import { AuthInterceptor, MtqInterceptor } from '@igo2/auth';

export class VectorTileLayer extends Layer {
  public dataSource: MVTDataSource;
  public options: VectorTileLayerOptions;
  public ol: olLayerVectorTile;

  private watcher: TileWatcher;

  constructor(
    options: VectorTileLayerOptions,
    public authInterceptor?: AuthInterceptor,
    public mtqInterceptor?: MtqInterceptor) {
    super(options, authInterceptor, mtqInterceptor);
    this.watcher = new TileWatcher(this);
    this.status$ = this.watcher.status$;
  }

  protected createOlLayer(): olLayerVectorTile {
    const olOptions = Object.assign({}, this.options, {
      source: this.options.source.ol as olSourceVectorTile
    });

    const vectorTile = new olLayerVectorTile(olOptions);
    const vectorTileSource = vectorTile.getSource() as olSourceVectorTile;

    // if (this.authInterceptor) {
    //   vectorTileSource.setTileLoadFunction((tile, src) => {
    //     this.customLoader(tile, src);
    //   });
    // }

    // if (this.mtqInterceptor) {
    //   vectorTileSource.setTileLoadFunction((tile, url) => {
    //     const loader = xhr(url, tile.getFormat(), tile.onLoad.bind(tile), tile.onError.bind(tile));
    //     tile.setLoader(loader);
    //   });
    // }

    if (this.mtqInterceptor) {
      vectorTileSource.setTileLoadFunction((tile, url) => {

        // tile.setLoader(this.customLoader(tile, url, this.mtqInterceptor, vectorTileSource))
        const loader = this.loadFeaturesXhr(url, tile.getFormat(), tile.onLoad.bind(tile));
        tile.setLoader(loader);
      }
      );

    }
    return vectorTile;
  }

  loadFeaturesXhr(url, format, success) {
    return ((extent, resolution, projection) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', typeof url === 'function' ? url(extent, resolution, projection) : url, true);
      console.log(format, format.getType());
      // if (format.getType() === FormatType.ARRAY_BUFFER) {
      //   xhr.responseType = 'arraybuffer';
      // }
      xhr.onload = (event) => {
        if (!xhr.status || xhr.status >= 200 && xhr.status < 300) {
          const type = format.getType();
          let source = void 0;
          /*if (type == FormatType.JSON || type == FormatType.TEXT) {
            source = xhr.responseText;
          }
          else if (type == FormatType.XML) {
            source = xhr.responseXML;
            if (!source) {
              source = new DOMParser().parseFromString(xhr.responseText, 'application/xml');
            }
          }
          else if (type == FormatType.ARRAY_BUFFER) {*/
          source = (xhr.response);
          // }
          if (source) {
            success.call(this, format.readFeatures(source, {
              extent,
              featureProjection: projection
            }), format.readProjection(source));
          }
        }
      };
      xhr.send();
    });
  }

}

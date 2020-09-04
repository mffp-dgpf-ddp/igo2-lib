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

    if (this.mtqInterceptor) {
      vectorTileSource.setTileLoadFunction((tile, url) => {
        const loader = this.customLoader(url, tile.getFormat(), this.mtqInterceptor, tile.onLoad.bind(tile));
        tile.setLoader(loader);
      }
      );
    }
    return vectorTile;
  }

  customLoader(url, format, interceptor, success, failure?) {
    return ((extent, resolution, projection) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', typeof url === 'function' ? url(extent, resolution, projection) : url, true);
      const intercepted = interceptor.interceptXhr(xhr);
      if (!intercepted) {
        xhr.abort();
        return;
      }
      if (format.getType() === 'arraybuffer') {
        xhr.responseType = 'arraybuffer';
      }
      xhr.onload = (event) => {
        if (!xhr.status || xhr.status >= 200 && xhr.status < 300) {
          const type = format.getType();
          let source;
          if (type === 'json' || type === 'text') {
            source = xhr.responseText;
          }
          else if (type === 'xml') {
            source = xhr.responseXML;
            if (!source) {
              source = new DOMParser().parseFromString(xhr.responseText, 'application/xml');
            }
          }
          else if (type === 'arraybuffer') {
            source = xhr.response;
          }
          if (source) {
            success.call(this, format.readFeatures(source, {
              extent,
              featureProjection: projection
            }), format.readProjection(source));
          }
          else {
            // TODO
            failure.call(this);
          }
        } else {
          // TODO
          failure.call(this);
        }
      };
      xhr.onerror = () => {
        // TODO
        failure.call(this);
      };
      xhr.send();
    });
  }
}

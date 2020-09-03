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

    const vectorTile =  new olLayerVectorTile(olOptions);
    const vectorTileSource = vectorTile.getSource() as olSourceVectorTile;

    if (this.authInterceptor) {
      vectorTileSource.setTileLoadFunction((tile, src) => {
        this.customLoader(tile, src);
      });
    }

    if (this.mtqInterceptor) {
      vectorTileSource.setTileLoadFunction((tile, src) => {
        this.customLoader(tile, src);
      });
    }

    return vectorTile;
  }

  private customLoader(tile, src) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', src);

    // const intercepted = this.authInterceptor.interceptXhr(xhr, src);
    // if (!intercepted) {
    //   xhr.abort();
    //   tile.getImage().src = src;
    //   return;
    // }

    const mtqIntercepted = this.mtqInterceptor.interceptXhr(xhr);
    if (!mtqIntercepted) {
      xhr.abort();
      tile.getImage().src = src;
      return;
    }

    xhr.responseType = 'arraybuffer';

    xhr.onload = function() {
      const arrayBufferView = new Uint8Array((this as any).response);
      const blob = new Blob([arrayBufferView], { type: 'image/png' });
      const urlCreator = window.URL;
      const imageUrl = urlCreator.createObjectURL(blob);
      tile.getImage().src = imageUrl;
    };
    xhr.send();
  }
}

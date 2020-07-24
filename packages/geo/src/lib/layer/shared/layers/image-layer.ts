import olLayerImage from 'ol/layer/Image';
import olSourceImage from 'ol/source/Image';

import { AuthInterceptor, MtqInterceptor } from '@igo2/auth';

import { ImageWatcher } from '../../utils';
import { IgoMap } from '../../../map';

import { WMSDataSource } from '../../../datasource/shared/datasources/wms-datasource';

import { Layer } from './layer';
import { ImageLayerOptions } from './image-layer.interface';

export class ImageLayer extends Layer {
  public dataSource: WMSDataSource;
  public options: ImageLayerOptions;
  public ol: olLayerImage;

  private watcher: ImageWatcher;

  constructor(
    options: ImageLayerOptions,
    public authInterceptor?: AuthInterceptor,
    public mtqInterceptor?: MtqInterceptor
  ) {
    super(options, authInterceptor, mtqInterceptor);
    this.watcher = new ImageWatcher(this);
    this.status$ = this.watcher.status$;
  }

  protected createOlLayer(): olLayerImage {
    const olOptions = Object.assign({}, this.options, {
      source: this.options.source.ol as olSourceImage
    });

    const image = new olLayerImage(olOptions);
    if (this.authInterceptor) {
      (image.getSource() as any).setImageLoadFunction((tile, src) => {
        this.customLoader(tile, src);
      });
    }

    if (this.mtqInterceptor) {
      (image.getSource() as any).setImageLoadFunction((tile, src) => {
        this.customLoader(tile, src);
      });
    }
    return image;
  }

  public setMap(map: IgoMap | undefined) {
    if (map === undefined) {
      this.watcher.unsubscribe();
    } else {
      this.watcher.subscribe(() => {});
    }
    super.setMap(map);
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

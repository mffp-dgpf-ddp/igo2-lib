import { MapViewOptions } from '../../map';
import { AnyLayerOptions } from '../../layer';
import { Tool } from '../../tool/shared/tool.interface';


export interface Context {
  title: string;
  uri: string;
  scope?: 'public' | 'protected' | 'private';
  description?: string;
  icon?: string;
}

export interface DetailedContext extends Context {
  map?: MapContext;
  layers?: AnyLayerOptions[];
  tools?: Tool[];
  toolbar?: string[];
}

export interface MapViewContext extends MapViewOptions {
  keepCurrentView?: boolean;
}

export interface MapContext  {
  view: MapViewContext;
}

export interface ContextServiceOptions {
  basePath: string;
  contextListFile: string;
}
import { strEnum } from '@igo2/utils';

export const ExportFormat = strEnum(['GeoJSON', 'GML', 'GPX', 'KML', 'Shapefile', 'CSVcomma', 'CSVsemicolon']);
export type ExportFormat = keyof typeof ExportFormat;

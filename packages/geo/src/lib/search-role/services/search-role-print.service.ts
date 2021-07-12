import { Injectable } from '@angular/core';
import * as jsPDF from 'jspdf';
import { Platform } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { IgoMap } from '../../map/shared';
import domtoimage from 'dom-to-image';

@Injectable({
  providedIn: 'root'
})
export class SearchRolePrintService {

  private month; date; day; year; hours; minutes;

  constructor(
    private platform: Platform,
    private fileOpener: FileOpener,
    private file: File
  ) { }

  private setDate() {
    this.date = new Date();
    this.day = this.date.getDate().toString();
    this.month = this.date.getMonth() + 1;
    if (this.month < 10) {
      this.month = '0' + this.month.toString();
    }
    this.year = this.date.getFullYear().toString();
    this.hours = this.date.getHours().toString();
    this.minutes = this.date.getMinutes().toString();
  }

  savePDF(pdf: any) {
    if (this.platform.is('cordova')) {
      const pdfOutput = pdf.output();
      const buffer = new ArrayBuffer(pdfOutput.length);
      const array = new Uint8Array(buffer);
      for (let i = 0; i < pdfOutput.length; i++) {
        array[i] = pdfOutput.charCodeAt(i);
      }
      const directory = this.file.externalApplicationStorageDirectory;
      this.file.writeFile(directory, `resultat_export.pdf`, buffer, { replace: true }).then((success) =>
        this.fileOpener.open(directory + '/' + `resultat_export.pdf`, 'application/pdf').then(() => console.log('File is opened'))
      ).catch((error) => console.log('Cannot Create File ' + JSON.stringify(error)));
    } else {
      return pdf.save(`${this.year}-${this.month}-${this.day}/${this.hours}h${this.minutes}`, { returnsPromise: true });
    }
  }

  public async exportRoleResultToPdf(keys: any, coordinates: Coordinates, map: IgoMap) {
    this.setDate();
    const html = this.keysToHtmlTable(keys, '');
    if (html === null) {
      return new Promise<any>((resolve, reject) => {
        reject('Impossible de créer un pdf des résultats grif invalides');
      });
    }
    const that = this;

    const dims = {
      a0: [1189, 841],
      a1: [841, 594],
      a2: [594, 420],
      a3: [420, 297],
      a4: [297, 210],
      a5: [210, 148]
    };

    const format = 'a5';
    const resolution = 72;
    const dim = dims[format];
    const width = Math.round(dim[0] * resolution / 25.4);
    const height = Math.round(dim[1] * resolution / 25.4);

    if (coordinates[0] !== 0 && coordinates[1] !== 0) {
      const size = map.ol.getSize();
      const extent = map.ol.getView().calculateExtent(size);

      const printSize = [width, height];
      map.ol.setSize(printSize);
      map.ol.getView().fit(extent, { size: printSize });

      map.ol.once('rendercomplete', event => {
        let layerNodes = map.ol.getViewport().querySelector('.ol-layers');
        layerNodes.crossOrigin = 'Anonymous';
        let node1 = layerNodes.children[0];
        let node2 = layerNodes.children[1];
 
        const canvas = node1.children[0];
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
        canvas.crossOrigin ='Anonymous';
        ctx.putImageData(imageData, canvas.width,canvas.height);
        const data = canvas.toDataURL('image/jpeg');
        
        
  
           
        
        domtoimage.toPng(node2).then(function(dataUrl) {

          const pdf = new jsPDF();
  
          pdf.fromHTML(html, 15, 15);
          pdf.addPage();
          pdf.addImage(data, 'JPEG', 15, 40, 180, 160);
          pdf.addImage(dataUrl, 'PNG', 15, 40, 180, 160);

          console.log(pdf);
          that.savePDF(pdf);
        });
      });
      map.ol.setSize(size);
      map.ol.getView().fit(extent, { size });
 
    } else {
      const pdf = new jsPDF();
      pdf.fromHTML(html, 15, 15);
      this.savePDF(pdf);
    }
  }

  public keysToHtmlTable(ficheKeys: any, queryString: string): string {
    if (ficheKeys) {
        let html = '';
        if (queryString) {
          html += `<h3> Requête : ${queryString}</h3>`;
        }
        html += `<h3> Date de la recherche : ${this.year}-${this.month}-${this.day} à ${this.hours}:${this.minutes} </h3>`;
        html += '<table><tbody>';

        if (ficheKeys) {
          for (var key in ficheKeys){
            html += `<tr><td><b> ${key}</b> : ${ficheKeys[key]} </td></tr>`;
          }

          html += `</tbody></table>`;
          return html;
        }
      }
    return null;
    }
}


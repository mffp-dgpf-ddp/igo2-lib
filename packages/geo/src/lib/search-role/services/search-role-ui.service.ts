import { Component, ComponentRef, Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class SearchRoleUiService {

  constructor(
    private modalController: ModalController
  ) { }

  async presentSearchResults(component: any, searchResults: any) {
    return await this.showSearchResults(component, searchResults);
  }

  async showSearchResults(component: any, searchResults: any) {
    let componentProps;
      componentProps = {
        searchResults,
      };
    return new Promise<boolean>(async resolve => {
      const modal = await this.modalController.create({
        component,
        componentProps,
        backdropDismiss: false,
        keyboardClose: true
      });
      await modal.present();
    });
  }

  closeModal() {
    this.modalController.dismiss();
  }

  dissmissModals() {
    this.modalController.getTop().then(
      (value) => {
        if (value) {
          this.modalController.dismiss().then(
            () => {
              this.dissmissModals();
            }
          );
        }
      }
    );
  }
}

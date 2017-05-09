import { Component, Input } from '@angular/core';


@Component({
  selector: 'igo-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.styl'],
})
export class SpinnerComponent {

  @Input()
  get shown() { return this._shown; }
  set shown(value: boolean) {
    this._shown = value;
  }
  private _shown: boolean = false;

  constructor() {}
}

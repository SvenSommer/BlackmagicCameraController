import { Component, Input } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  constructor() { }
  @Output() configModeChange = new EventEmitter<boolean>();
  @Output() presentationModeChange: EventEmitter<string> = new EventEmitter<string>();

  configMode: boolean = false;
  currentPresentationMode: string = "basic";

  onChangeConfigMode(event: MatSlideToggleChange) {
    this.configMode = event.checked;
    this.configModeChange.emit(event.checked);
  }

  onChangePresentationMode(mode: string) {
    this.currentPresentationMode = mode;
    this.presentationModeChange.emit(this.currentPresentationMode);
  }

}

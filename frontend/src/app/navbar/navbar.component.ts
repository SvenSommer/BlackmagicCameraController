import { Component, Input } from '@angular/core';
import { ConfigFile } from '../models/config-model';
import { ProtocolService } from '../services/protocol.services';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ConfigService } from '../services/config.services';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @Input() configData: ConfigFile;
  @Input() groupsData: any;
  @Input() protocolService: ProtocolService
  @Input() configService: ConfigService
  @Output() configModeChange = new EventEmitter<boolean>();
  @Output() presentationModeChange: EventEmitter<string> = new EventEmitter<string>();

  configMode: boolean = false;
  currentPresentationMode: string = "basic";

  onChangeConfigMode(event: MatSlideToggleChange) {
    if (!event.checked) {
      this.protocolService.saveGroups(this.groupsData).subscribe(
        (response) => {
          // Handle the response from the server here
        },
        (error) => {
          console.error(error);
          // Handle any errors that occur here
        });
      this.configService.saveConfig(this.configData).subscribe(
        (response) => {
          // Handle the response from the server here
        },
        (error) => {
          console.error(error);
          // Handle any errors that occur here
        });
    }
    this.configMode = event.checked;
    this.configModeChange.emit(event.checked);
  }

  onChangePresentationMode(mode: string) {
    this.currentPresentationMode = mode;
    this.presentationModeChange.emit(this.currentPresentationMode);
  }

}

import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ConfigFile } from './models/config-model';
import { DiscreteParameter } from './models/discreteParameter-model';
import { Parameter } from './models/parameter-model';
import { ConfigService } from './services/config.services';
import { ProtocolService } from './services/protocol.services';
import { CameraState } from './models/cameraState-model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(
    public protocolService: ProtocolService,
    public configService: ConfigService,
  ) { }

  public userParameterConfig: any;
  public configMode: boolean;
  public groupsData: any;
  public configData: ConfigFile;
  public currentGroup: number;
  public currentPresentationMode: string = "basic";
  public currentParameter: Parameter;
  public discreteParameterChoosen: DiscreteParameter;
  public cameraStates: { [key: string]: CameraState } = {};

  ngOnInit() {
    this.bindData();
  }

  changeConfigMode($event: boolean) {
    this.configMode = ($event);
    this.saveConfiguration();
  }

  saveConfiguration() {
    this.protocolService.saveGroups(this.groupsData).subscribe(
      (response) => {
      },
      (error) => {
        console.error(error);
        // Handle any errors that occur here
      });
  }

  onPresentationModeChange(mode: string) {
    this.currentPresentationMode = mode;
  }


  changeCurrentParameter(parameter: Parameter) {
    this.currentParameter = parameter;
  }


  bindData() {
    this.protocolService.getGroups().subscribe(
      (data) => {
        if (data) {
          if (data.body && data.status == 200) {
            this.groupsData = data.body.groups;
          }
        }
      },
      (error: HttpErrorResponse) => {
        console.log(error.name + ' ' + error.message);
      }
    );
    this.configService?.getConfig().subscribe(
      (data) => {
        if (data) {
          if (data.body && data.status == 200) {
            this.configData = data.body.config;
          }
        }
      },
      (error: HttpErrorResponse) => {
        console.log(error.name + ' ' + error.message);
      }
    );
  }
}

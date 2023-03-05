import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
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

  title = "CamerControler"
  constructor(
    private protocolService: ProtocolService, 
    private configService: ConfigService,

    
    ) { }

  public userParameterConfig : any;
  public maxRows: number;
  public configMode: boolean;
  public groupsData: any;
  public configData: ConfigFile;
  public currentGroup: number;
  public currentPresentationMode: string = "basic";
  public currentParameter: Parameter;
  public currentSteps: number;
  public discreteParameterChoosen: DiscreteParameter;

  public columnWidth: string;
  public cameraStates: { [key: string]: CameraState } = {};

  ngOnInit() {      
    this.bindData();
    this.maxRows = Math.max(...this.groupsData.map((group: { parameters: any[]; }) => Math.max(...group.parameters.map(p => p.row))));
    const numCameras = this.configData?.cameras?.length ?? 0;
    this.columnWidth = numCameras > 0 ? `col-md-${12 / numCameras}` : '';
  }


  onChangeConfigMode($event: MatSlideToggleChange){
    if(!$event.checked){
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
  }

  toggleParameterVisibility(parameter: any) {
    parameter.visible = !parameter.visible;
  }

  shouldDisplayGroup(group: any): boolean {
    let hasParameters =  group.parameters.some((p: { visible: boolean; }) => p.visible);
    return hasParameters || this.configMode
  }

  changecurrentGroup(id: number){
    this.currentGroup = id
  }

  changeCurrentParameter(parameter: Parameter){
    this.currentParameter = parameter
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
    this.configService.getConfig().subscribe(
      (data) => {
        if (data) {
          if (data.body && data.status == 200) {
            this.configData = data.body.config;
            console.log(this.configData)
          }
        }
      },
      (error: HttpErrorResponse) => {
        console.log(error.name + ' ' + error.message);
      }
    );
  }
}

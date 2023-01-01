import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { DiscreteParameter } from './models/discreteParameter-model';
import { Parameter } from './models/parameter-model';
import { ConfigService } from './services/config.services';
import { ProtocolService } from './services/protocol.services';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = "CamerControler"
  constructor(private protocolService: ProtocolService, private configService: ConfigService) { }


  public groupsData: any;
  public camerasData: any;
  public currentCamera: any;
  public currentGroup: number;
  public currentParameter: Parameter;
  public currentSteps: number;
  public discreteParameterChoosen: DiscreteParameter;
  public allowed_for_slider = ['int64','int32','int16','int8','fixed16']
  public allowed_for_switches = ['boolean']

  onChange($event: MatSlideToggleChange) {
    console.log($event);
}

  ngOnInit() {      
      this.bindData();
      this.changeCurrentCamera(1)
  }

  changeCurrentCamera(id: number){
    this.currentCamera = id
  }

  changecurrentGroup(id: number){
    this.currentGroup = id
  }

  changeCurrentParameter(parameter: Parameter){
    console.log(parameter)
    this.currentParameter = parameter
    this.calculateCurrentSteps(parameter);
  }

  private calculateCurrentSteps(parameter: Parameter) {
    this.currentSteps = (parameter.maximum - parameter.minimum) / 100;
    console.log("steps:" + this.currentSteps);
  }

  bindData() {
    this.protocolService.getProtocol().subscribe(
      (data) => {
        if (data) {
          if (data.body && data.status == 200) {
            this.groupsData = data.body.protocol.groups;
            console.log(  this.groupsData )
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
            this.camerasData = data.body.config;
            console.log(this.camerasData)
          }
        }
      },
      (error: HttpErrorResponse) => {
        console.log(error.name + ' ' + error.message);
      }
    );
  }
}

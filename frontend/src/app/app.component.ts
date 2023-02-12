import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Command } from './models/command-model';
import { ConfigFile } from './models/config-model';
import { DiscreteParameter } from './models/discreteParameter-model';
import { Index } from './models/index-model';
import { Parameter } from './models/parameter-model';
import { CommandService } from './services/command.services';
import { ConfigService } from './services/config.services';
import { ProtocolService } from './services/protocol.services';


type Nullable<T> = T | null;
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
    private commandService: CommandService
    ) { }


  public userParameterConfig : any;
  public configMode: boolean;
  public groupsData: any;
  public configData: ConfigFile;
  public currentCamera: any;
  public currentGroup: number;
  public currentParameter: Parameter;
  public currentSteps: number;
  public discreteParameterChoosen: DiscreteParameter;
  public allowed_for_slider = ['int64','int32','int16','int8','fixed16']
  public allowed_for_switches = ['boolean']

  onChange($event: MatSlideToggleChange) {
    this.currentParameter.value = $event.checked
    var command = new Command(this.currentCamera, this.currentParameter);
    this.commandService.sendCommand_for_value(command);
  }
  onChange_radioGroup($event: any) {
    console.log($event)
    this.currentParameter.value = $event.value
    var command = new Command(this.currentCamera, this.currentParameter);
    this.commandService.sendCommand_for_value(command);
  }

  onSend(parameter: Parameter) {
    if(parameter.value != undefined || parameter.type == "void") {
      var command = new Command(this.currentCamera, parameter);
      this.commandService.sendCommand_for_value(command);
    }
  }

  ngOnInit() {      
    this.bindData();
    this.changeCurrentCamera(1)
  }

  saveCameraName(camera: any) {
    // Call your API or perform any other logic to save the updated camera name
    console.log(`Saving camera name "${camera.name}" for camera ID ${camera.id}`);
  }

  toggleParameterVisibility(parameter: any) {
    parameter.visible = !parameter.visible;
    console.log( parameter.visible)
  }

  shouldDisplayGroup(group: any): boolean {
    let hasParameters =  group.parameters.some((p: { visible: boolean; }) => p.visible);
    return hasParameters || this.configMode
  }

  changeCurrentCamera(id: number){
    this.currentCamera = id
  }

  changecurrentGroup(id: number){
    this.currentGroup = id
  }

  changeCurrentParameter(parameter: Parameter){
    this.currentParameter = parameter
  }

  public calculateCurrentSteps(minimum: Nullable<number>, maximum: Nullable<number>) {
    if (minimum != null && maximum != null)
      return (maximum - minimum) / 100;
    else 
      return 0
  }

  is_valid_parameter(parameter:Parameter): boolean {
    return parameter.value != undefined
  }

  param_is_void(parameter:Parameter): boolean {
    return parameter.type == "void"
  }

  param_is_single(parameter: Parameter): boolean {
    return !(parameter.index && parameter.index.length > 0);
   }

  param_is_input(parameter: Parameter): boolean {
    return parameter.maximum == null && parameter.minimum == null && !parameter.discrete && parameter.type && !this.param_is_void(parameter) && !this.param_is_switch(parameter) 
   }
  param_is_slider(parameter: Parameter): boolean {
    return this.allowed_for_slider.includes(parameter.type) &&  !this.param_is_input(parameter) && ((parameter.discrete && parameter.discrete.length < 1) || !parameter.discrete);
   }
  param_is_switch(parameter: Parameter): boolean {
    return this.allowed_for_switches.includes(parameter.type);
   }
   param_is_radiogroup(parameter: Parameter): boolean {
      return parameter.discrete && parameter.discrete.length > 0
   }

   index_is_input(index:Index): boolean {
    return index.maximum == null && index.minimum == null && !index.discrete
   }
  index_is_slider(index: Index): boolean {
    return this.allowed_for_slider.includes(index.type) && index.maximum != null && index.minimum != null && ((index.discrete && index.discrete.length < 1) || !index.discrete);
   }

   index_is_radiogroup(index: Index): boolean {
    return index.discrete && index.discrete.length > 0;
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

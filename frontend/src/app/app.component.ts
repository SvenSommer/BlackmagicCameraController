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
import { Camera } from './models/camera-model';
import { CameraState } from './models/cameraState-model';


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
    private commandService: CommandService,
    
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
  public allowed_for_slider = ['int64','int32','int16','int8','fixed16']
  public allowed_for_switches = ['boolean']
  public columnWidth: string;
  public cameraStates: { [key: string]: CameraState } = {};

  ngOnInit() {      
    this.bindData();
    this.maxRows = Math.max(...this.groupsData.map((group: { parameters: any[]; }) => Math.max(...group.parameters.map(p => p.row))));
    const numCameras = this.configData?.cameras?.length ?? 0;
    this.columnWidth = numCameras > 0 ? `col-md-${12 / numCameras}` : '';
  }

  getVoidParameters(){
    const flattened = this.groupsData
    .flatMap((group: { parameters: any }) => group.parameters)
    .filter((parameter: { visible: boolean }) => parameter.visible)
    .filter((p: { cameraSpecific: string }) => p.cameraSpecific === 'true')
    .filter((p: { presentationMode: string; }) => p.presentationMode === this.currentPresentationMode)
    .filter((p: Parameter) => this.param_is_void(p))
    .sort((a: { row: number }, b: { row: number }) => a.row - b.row);
    return flattened
  }

  getParemetersbyRows(isCameraSpecific: string): Parameter[] {
    const flattened = this.groupsData
      .flatMap((group: { parameters: any }) => group.parameters)
      .filter((parameter: { visible: boolean }) => parameter.visible)
      .filter((p: { cameraSpecific: string }) => p.cameraSpecific === isCameraSpecific)
      .filter((p: { presentationMode: string; }) => p.presentationMode === this.currentPresentationMode)
      .sort((a: { row: number }, b: { row: number }) => a.row - b.row);
    //console.log('flattened:', flattened);
  
    return flattened
  }



  newDiscreteValue: DiscreteParameter = new DiscreteParameter({});

  isDiscreteParameter(parameter: Parameter): boolean {
    return parameter.discrete !== undefined;
  }

  defineUniqueCameraStateId(camera: Camera, parameter: Parameter){
    return `${camera.id}_${parameter.group_id}_${parameter.id}`;
  }

  setCameraState(camera: Camera, parameter: Parameter) {
    const uniqueIdentifier = this.defineUniqueCameraStateId(camera, parameter);
    this.cameraStates[uniqueIdentifier] = new CameraState({ cameraId: camera.id, parameterUniqueID: uniqueIdentifier, value: parameter.value });
  }
  
  getCameraState(camera: Camera, parameter: Parameter) {
    const uniqueIdentifier = this.defineUniqueCameraStateId(camera, parameter);
    return this.cameraStates[uniqueIdentifier]?.value;
  }
  
  onChange(camera: Camera, event: MatSlideToggleChange) {
    this.sendCommand(camera, { ...this.currentParameter, value: event.checked });
  }
  
  onChange_radioGroup(camera: Camera, event: any) {
    this.sendCommand(camera, { ...this.currentParameter, value: event.value });
  }
  
  onSend(camera: Camera, parameter: Parameter) {
    if (this.isValidParameterValue(parameter)) {
      this.sendCommand(camera, parameter);
    }
  }
  
  onSendAllCameras(parameter: Parameter) {
    this.configData.cameras.forEach((camera) => {
      if (this.isValidParameterValue(parameter)) {
        this.sendCommand(camera, parameter);
      }
    });
  }
  
  onDiscreteValueSelect(camera: Camera, parameter: Parameter, value: DiscreteParameter) {
    if (value) {
      parameter.value = value.value;
      this.sendCommand(camera, parameter);
    }
  }
  
  onDiscreteValueSelectAllCameras(parameter: Parameter, value: DiscreteParameter) {
    if (value) {
      this.configData.cameras.forEach((camera) => {
        parameter.value = value.value;
        this.sendCommand(camera, parameter);
      });
    }
  }
  

  
  private isValidParameterValue(parameter: Parameter) {
    return parameter.value !== undefined || parameter.type === "void";
  }
  
  private sendCommand(camera: Camera, parameter: Parameter) {
    if (this.isValidParameterValue(parameter)) {
      this.setCameraState(camera, parameter);
      const command = new Command(camera.id, parameter);
      this.commandService.sendCommand_for_value(command);
    }
  }
  

  onDefaultDiscreteValueChangeDay(valueIndex: number, parameter: Parameter): void {
    parameter.presetValueDay = valueIndex;
  }

  onDefaultDiscreteValueChangeNight(valueIndex: number, parameter: Parameter): void {
    parameter.presetValueNight = valueIndex;
  }

  addDiscreteValue(parameter: Parameter): void {
    parameter.discrete.push(new DiscreteParameter(this.newDiscreteValue));
    this.newDiscreteValue = new DiscreteParameter({});
  }

  onDeleteDiscreteValue(parameter: Parameter, index: number): void {
    parameter.discrete.splice(index, 1);
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

  setPresentationMode(event: Event) {
    const target = event.target as HTMLInputElement;
    const mode = target.value;
    if (mode) {
      this.currentParameter.presentationMode = mode;
      console.log(mode);
    }
  }

  onCaptionChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const caption = target.value;
    if (caption) {
      this.currentParameter.caption = caption;
      console.log(caption);
    }
  }
  
  onRowChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const row = parseInt(target.value);
    if (!isNaN(row)) {
      this.currentParameter.row = row;
      console.log(row);
    }
  }

  onColChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const col = parseInt(target.value);
    if (!isNaN(col)) {
      this.currentParameter.col = col;
      console.log(col);
    }
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

   getPresetParameter(){
    return this.groupsData
    .flatMap((group: { parameters: any }) => group.parameters)
    .filter((parameter: {presetActive: boolean; }) => parameter.presetActive);
   }

   checkAndSendPresetParameter(value: any, parameter: Parameter, camera: Camera){
    if(value != undefined){
      parameter.value = value;
      this.sendCommand(camera, parameter);
    }
   }

   onSendPresetDay(camera: Camera){
    const presetParameters =  this.getPresetParameter();
    presetParameters.forEach((parameter: Parameter) => {
      this.checkAndSendPresetParameter(parameter.presetValueDay, parameter, camera)
    });
   }

   onSendPresetNight(camera: Camera){
    const presetParameters =  this.getPresetParameter();
    presetParameters.forEach((parameter: Parameter) => {
      this.checkAndSendPresetParameter(parameter.presetValueNight, parameter, camera)
    });
   }

   isPresetDay(camera: Camera) : boolean{
    for (const parameter of this.getPresetParameter()) {
      const cameraStateId = this.defineUniqueCameraStateId(camera, parameter);
      const cameraState = this.cameraStates[cameraStateId];
      if (!cameraState || cameraState.value !== parameter.presetValueDay) {
        return false;
      }
    }
    return true;
   }

   isPresetNight(camera: Camera){
    for (const parameter of this.getPresetParameter()) {
      const cameraStateId = this.defineUniqueCameraStateId(camera, parameter);
      const cameraState = this.cameraStates[cameraStateId];
      if (!cameraState || cameraState.value !== parameter.presetValueNight) {
        return false;
      }
    }
    return true;
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

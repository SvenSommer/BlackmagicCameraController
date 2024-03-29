import { Component, Input } from '@angular/core'; // First, import Input
import { Parameter } from '../models/parameter-model';
import { Index } from '../models/index-model';
import { Camera } from '../models/camera-model';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ConfigFile } from '../models/config-model';
import { DiscreteParameter } from '../models/discreteParameter-model';
import { CameraState } from '../models/cameraState-model';
import { CommandService } from '../services/command.services';
import { DiscreteIndexParameter } from '../models/discreteIndexParameter-model';
type Nullable<T> = T | null;
@Component({
  selector: 'app-controlpanel',
  templateUrl: './controlpanel.component.html',
  styleUrls: ['./controlpanel.component.css']
})
export class ControlpanelComponent {
  @Input() groupsData: any;
  @Input() currentPresentationMode: string;
  @Input() configData: ConfigFile;
  @Input() cameraStates: { [key: string]: CameraState } = {};
  @Input() currentParameter: Parameter;

  private allowed_for_slider = ['int64', 'int32', 'int16', 'int8', 'fixed16']
  public allowed_for_switches = ['boolean']

  constructor(private commandService: CommandService) { }


  getParemetersbyRows(isCameraSpecific: string): Parameter[] {
    if (this.groupsData != undefined) {
      const flattened = this.groupsData
        .flatMap((group: { parameters: any }) => group?.parameters)
        .filter((parameter: { visible: boolean }) => parameter.visible)
        .filter((p: { cameraSpecific: string }) => p.cameraSpecific === isCameraSpecific)
        .filter((p: { presentationMode: string; }) => p.presentationMode === this.currentPresentationMode)
        .filter((p: { type: string; }) => p.type != 'void')
        .sort((a: { row: number }, b: { row: number }) => a.row - b.row);
      return flattened
    }
    return new Array;
  }

  param_is_void(parameter: Parameter): boolean {
    return parameter.type == "void"
  }

  param_is_single(parameter: Parameter): boolean {
    return !(parameter.index && parameter.index.length > 0);
  }

  param_is_input(parameter: Parameter): boolean {
    return parameter.maximum == null && parameter.minimum == null && !parameter.discrete && parameter.type && !this.param_is_void(parameter) && !this.param_is_switch(parameter)
  }

  param_is_switch(parameter: Parameter): boolean {
    return this.allowed_for_switches.includes(parameter.type);
  }


  param_is_radiogroup(parameter: Parameter): boolean {
    return parameter.discrete && parameter.discrete.length > 0
  }

  index_is_input(index: Index): boolean {
    return index.maximum == null && index.minimum == null && !index.discrete
  }
  index_is_slider(index: Index): boolean {
    return this.allowed_for_slider.includes(index.type) && index.maximum != null && index.minimum != null && ((index.discrete && index.discrete.length < 1) || !index.discrete);
  }

  index_is_radiogroup(index: Index): boolean {
    return index.discrete && index.discrete.length > 0;
  }

  onChange(camera: Camera, event: MatSlideToggleChange) {
    this.setCameraState(camera, this.currentParameter);
    this.commandService.sendCommand(camera, this.currentParameter);
  }

  onChange_radioGroup(camera: Camera, event: any) {
    this.setCameraState(camera, this.currentParameter);
    this.commandService.sendCommand(camera, this.currentParameter);
  }

  onSend(camera: Camera, parameter: Parameter) {
    if (this.commandService.isValidParameterValue(parameter)) {
      this.setCameraState(camera, parameter);
      this.commandService.sendCommand(camera, parameter);
    }
  }

  onSendAllCameras(parameter: Parameter) {
    this.configData.cameras.forEach((camera) => {
      if (this.commandService.isValidParameterValue(parameter)) {
        this.setCameraState(camera, parameter);
        this.commandService.sendCommand(camera, parameter);
      }
    });
  }

  onSendPresetDay(camera: Camera) {
    const presetParameters = this.getPresetParameter();
    presetParameters.forEach((parameter: Parameter) => {
      this.checkAndSendPresetParameter(parameter.presetValueDay, parameter, camera)
      this.checkAndSendPresetIndexParameter(parameter, camera, 'day');
    });
  }

  onSendPresetNight(camera: Camera) {
    const presetParameters = this.getPresetParameter();
    presetParameters.forEach((parameter: Parameter) => {
      this.checkAndSendPresetParameter(parameter.presetValueNight, parameter, camera)
      this.checkAndSendPresetIndexParameter(parameter, camera, 'night');
    });
  }



  isPresetDay(camera: Camera): boolean {
    for (const parameter of this.getPresetParameter()) {
      const cameraStateId = this.defineUniqueCameraStateId(camera, parameter);
      const cameraState = this.cameraStates[cameraStateId];
      if (!cameraState || cameraState.value !== parameter.presetValueDay) {
        return false;
      }
    }
    return true;
  }

  getPresetParameter() {
    return this.groupsData
      .flatMap((group: { parameters: any }) => group.parameters)
      .filter((parameter: { presetActive: boolean; }) => parameter.presetActive);
  }



  getVoidParameters() {
    const flattened = this.groupsData
      .flatMap((group: { parameters: any }) => group.parameters)
      .filter((parameter: { visible: boolean }) => parameter.visible)
      .filter((p: { cameraSpecific: string }) => p.cameraSpecific === 'true')
      .filter((p: { presentationMode: string; }) => p.presentationMode === this.currentPresentationMode)
      .filter((p: Parameter) => this.param_is_void(p))
      .sort((a: { row: number }, b: { row: number }) => a.row - b.row);
    return flattened
  }

  isPresetNight(camera: Camera) {
    for (const parameter of this.getPresetParameter()) {
      const cameraStateId = this.defineUniqueCameraStateId(camera, parameter);
      const cameraState = this.cameraStates[cameraStateId];
      if (!cameraState || cameraState.value !== parameter.presetValueNight) {
        return false;
      }
    }
    return true;
  }

  public calculateCurrentSteps(minimum: Nullable<number>, maximum: Nullable<number>) {
    if (minimum != null && maximum != null)
      return (maximum - minimum) / 100;
    else
      return 0
  }

  is_valid_parameter(parameter: Parameter): boolean {
    return parameter.value != undefined
  }

  isCurrentDiscreteValueShown(camera: Camera, discreteParameter: DiscreteParameter) {
    if (discreteParameter.cameraIdInactive?.includes(camera.id)) {
      return true
    }
    return false
  }

  getCameraState(camera: Camera, parameter: Parameter) {
    const uniqueIdentifier = this.defineUniqueCameraStateId(camera, parameter);
    return this.cameraStates[uniqueIdentifier]?.value;
  }

  defineUniqueCameraStateId(camera: Camera, parameter: Parameter) {
    return `${camera.id}_${parameter.group_id}_${parameter.id}`;
  }

  setCameraState(camera: Camera, parameter: Parameter) {
    const uniqueIdentifier = this.defineUniqueCameraStateId(camera, parameter);
    this.cameraStates[uniqueIdentifier] = new CameraState({ cameraId: camera.id, parameterUniqueID: uniqueIdentifier, value: parameter.value });
  }

  onDiscreteValueSelect(camera: Camera, parameter: Parameter, value: DiscreteParameter) {
    if (value) {
      parameter.value = value.value;
      this.setCameraState(camera, parameter);
      this.commandService.sendCommand(camera, parameter);
    }
  }

  onDiscreteValueSelectAllCameras(parameter: Parameter, discreteParameter: DiscreteParameter) {
    if (discreteParameter) {
      this.configData.cameras.forEach((camera) => {
        parameter.value = discreteParameter.value;
        this.setCameraState(camera, parameter);
        this.commandService.sendCommand(camera, parameter);
      });
    }
  }
  onDiscreteIndexValueSelectAllCameras(parameter: Parameter, discreteIndexParameter: DiscreteIndexParameter) {
    if (discreteIndexParameter) {
      this.configData.cameras.forEach((camera) => {
        this.commandService.sendIndexedCommand(camera, parameter, discreteIndexParameter);
      });
    }
  }

  checkAndSendPresetParameter(value: any, parameter: Parameter, camera: Camera) {
    if (value != undefined) {
      parameter.value = value;
      this.setCameraState(camera, parameter);
      this.commandService.sendCommand(camera, parameter);
    }
  }

  checkAndSendPresetIndexParameter(parameter: Parameter, camera: Camera, dayOrNight: string) {
    if (!parameter.discreteIndex) {
      return
    }
    if (dayOrNight == 'day') {
      const defaultDayParameters: DiscreteIndexParameter[] = parameter.discreteIndex.filter(param => param.isDefaultDay);
      defaultDayParameters.forEach(discreteIndexParameter => {
        this.commandService.sendIndexedCommand(camera, parameter, discreteIndexParameter);
      });
    } else {
      const defaultNightParameters: DiscreteIndexParameter[] = parameter.discreteIndex.filter(param => param.isDefaultNight);
      defaultNightParameters.forEach(discreteIndexParameter => {
        this.commandService.sendIndexedCommand(camera, parameter, discreteIndexParameter);
      });
    }

  }

  hasValidDiscreteParameters(parameter: Parameter) {
    return parameter.discrete.length > 0
  }







}

import { Component, Input } from '@angular/core'; // First, import Input
import { Parameter } from '../models/parameter-model';
import { ConfigFile } from '../models/config-model';
import { Camera } from '../models/camera-model';
import { CameraState } from '../models/cameraState-model';
import { DiscreteParameter } from '../models/discreteParameter-model';
import { CommandService } from '../services/command.services';

@Component({
  selector: 'app-parameter-settings',
  templateUrl: './parameter-settings.component.html',
  styleUrls: ['./parameter-settings.component.css']
})
export class ParameterSettingsComponent {
  @Input() currentParameter: Parameter;
  @Input() configData: ConfigFile;
  @Input() cameraStates: { [key: string]: CameraState } = {};

  private commandService: CommandService

  onCaptionChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const caption = target.value;
    if (caption) {
      this.currentParameter.caption = caption;
      console.log(caption);
    }
  }

  setPresentationMode(event: Event) {
    const target = event.target as HTMLInputElement;
    const mode = target.value;
    if (mode) {
      this.currentParameter.presentationMode = mode;
      console.log(mode);
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

  isDiscreteParameter(parameter: Parameter): boolean {
    return parameter.discrete !== undefined;
  }

  onDefaultDiscreteValueChangeDay(valueIndex: number, parameter: Parameter): void {
    parameter.presetValueDay = valueIndex;
  }

  onDefaultDiscreteValueChangeNight(valueIndex: number, parameter: Parameter): void {
    parameter.presetValueNight = valueIndex;
  }

  getCameraState(camera: Camera, parameter: Parameter) {
    const uniqueIdentifier = this.defineUniqueCameraStateId(camera, parameter);
    return this.cameraStates[uniqueIdentifier]?.value;
  }

  defineUniqueCameraStateId(camera: Camera, parameter: Parameter){
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
  
  onDiscreteValueSelectAllCameras(parameter: Parameter, value: DiscreteParameter) {
    if (value) {
      this.configData.cameras.forEach((camera) => {
        parameter.value = value.value;
        this.setCameraState(camera, parameter);
        this.commandService.sendCommand(camera, parameter);
      });
    }
  }

  isCurrentDiscreteValueShown(camera: Camera, discreteParameter: DiscreteParameter) {
    if (discreteParameter.cameraIdInactive?.includes(camera.id)) {
      return true
    }
    return false
  }

  onShowCurrentDiscreteValueChange(camera: Camera, discreteParameter: DiscreteParameter) {
    if (!discreteParameter.cameraIdInactive) {
      discreteParameter.cameraIdInactive = []; // Initialize array if undefined
    }

    if (discreteParameter.cameraIdInactive?.includes(camera.id)) {
      discreteParameter.cameraIdInactive = discreteParameter.cameraIdInactive.filter(id => id !== camera.id);
    } else {
      discreteParameter.cameraIdInactive.push(camera.id);
    }
  }

  onDeleteDiscreteValue(parameter: Parameter, index: number): void {
    parameter.discrete.splice(index, 1);
  }

  newDiscreteValue: DiscreteParameter = new DiscreteParameter({});

  addDiscreteValue(parameter: Parameter): void {
    parameter.discrete.push(new DiscreteParameter(this.newDiscreteValue));
    this.newDiscreteValue = new DiscreteParameter({});
  }




  

}

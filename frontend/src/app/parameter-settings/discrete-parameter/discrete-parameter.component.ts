import { Component, Input } from '@angular/core';
import { Camera } from 'src/app/models/camera-model';
import { CameraState } from 'src/app/models/cameraState-model';
import { ConfigFile } from 'src/app/models/config-model';
import { DiscreteParameter } from 'src/app/models/discreteParameter-model';
import { Parameter } from 'src/app/models/parameter-model';
import { CommandService } from 'src/app/services/command.services';

@Component({
  selector: 'app-discrete-parameter',
  templateUrl: './discrete-parameter.component.html',
  styleUrls: ['./discrete-parameter.component.css']
})
export class DiscreteParameterComponent {
  @Input() currentParameter: Parameter;
  @Input() configData: ConfigFile;
  @Input() cameraStates: { [key: string]: CameraState } = {};

  constructor(private commandService: CommandService) { }

  onDefaultDiscreteValueChangeDay(valueIndex: number, parameter: Parameter): void {
    parameter.presetValueDay = valueIndex;
  }

  onDefaultDiscreteValueChangeNight(valueIndex: number, parameter: Parameter): void {
    parameter.presetValueNight = valueIndex;
  }

  setCameraState(camera: Camera, parameter: Parameter) {
    const uniqueIdentifier = this.defineUniqueCameraParameterId(camera, parameter);
    this.cameraStates[uniqueIdentifier] = new CameraState({ cameraId: camera.id, parameterUniqueID: uniqueIdentifier, value: parameter.value });
  }

  getCameraState(camera: Camera, parameter: Parameter) {
    const uniqueIdentifier = this.defineUniqueCameraParameterId(camera, parameter);
    return this.cameraStates[uniqueIdentifier]?.value;
  }

  defineUniqueCameraParameterId(camera: Camera, parameter: Parameter) {
    return `${camera.id}_${parameter.group_id}_${parameter.id}`;
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
    if (!parameter.discrete) {
      parameter.discrete = [this.newDiscreteValue];
    }
    else {
      parameter.discrete.push(new DiscreteParameter(this.newDiscreteValue));
      this.newDiscreteValue = new DiscreteParameter({});
    }
  }

}

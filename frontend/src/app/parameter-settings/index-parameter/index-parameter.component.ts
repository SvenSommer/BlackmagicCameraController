import { Component, Input } from '@angular/core';
import { Camera } from 'src/app/models/camera-model';
import { CameraState } from 'src/app/models/cameraState-model';
import { ConfigFile } from 'src/app/models/config-model';
import { DiscreteIndexParameter } from 'src/app/models/discreteIndexParameter-model';
import { DiscreteParameter } from 'src/app/models/discreteParameter-model';
import { Index } from 'src/app/models/index-model';
import { IndexModel } from 'src/app/models/indexValue-model';
import { Parameter } from 'src/app/models/parameter-model';
import { CommandService } from 'src/app/services/command.services';

@Component({
  selector: 'app-index-parameter',
  templateUrl: './index-parameter.component.html',
  styleUrls: ['./index-parameter.component.css']
})
export class IndexParameterComponent {


  @Input() currentParameter: Parameter;
  @Input() configData: ConfigFile;
  @Input() cameraStates: { [key: string]: CameraState } = {};

  constructor(private commandService: CommandService) { }

  newDiscreteIndexValue: DiscreteIndexParameter = new DiscreteIndexParameter({});
  addDiscreteIndexValue(parameter: Parameter): void {
    if (!parameter.discreteIndex) {
      parameter.discreteIndex = [this.newDiscreteIndexValue];
    }
    else {
      parameter.discreteIndex.push(new DiscreteIndexParameter(this.newDiscreteIndexValue));
      this.newDiscreteIndexValue = new DiscreteIndexParameter({});
    }
  }

  onSelectIndexValue(discreteIndexParameter: DiscreteIndexParameter, discreteParameter: DiscreteParameter, indexValue: Index) {
    if (!discreteIndexParameter.values) {
      discreteIndexParameter.values = [];
    }

    const { position } = indexValue;
    const { type } = indexValue;
    const { value } = discreteParameter;
    const newIndexModel = new IndexModel({ position, value, type });

    const index = discreteIndexParameter.values.findIndex(val => val.position === indexValue.position);
    if (index === -1) {
      discreteIndexParameter.values.push(newIndexModel);
    } else {
      discreteIndexParameter.values[index] = newIndexModel;


    }
  }

  isIndexValueIsSelected(discreteIndexParameter: DiscreteIndexParameter, discreteParameter: DiscreteParameter, indexValue: Index): boolean {
    if (!discreteIndexParameter.values) {
      return false;
    }
    const selectedValue = discreteIndexParameter.values.find(val => val.position === indexValue.position);
    return !!selectedValue && selectedValue.value === discreteParameter.value;
  }

  onDefaultDiscreteIndexParameterChangeDay(discreteIndexParameter: DiscreteIndexParameter, currentParameter: Parameter) {
    currentParameter.discreteIndex.forEach((discreteIndexParameter) => {
      discreteIndexParameter.isDefaultDay = false;
    })
    discreteIndexParameter.isDefaultDay = true;
  }

  onDefaultDiscreteIndexParameterChangeNight(discreteIndexParameter: DiscreteIndexParameter, currentParameter: Parameter) {
    currentParameter.discreteIndex.forEach((discreteIndexParameter) => {
      discreteIndexParameter.isDefaultNight = false;
    })
    discreteIndexParameter.isDefaultNight = true;
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

  onDiscreteIndexParameterInvisibleChange(camera: Camera, discreteIndexParameter: DiscreteIndexParameter) {
    if (!discreteIndexParameter.cameraIdInactive) {
      discreteIndexParameter.cameraIdInactive = []; // Initialize array if undefined
    }

    if (discreteIndexParameter.cameraIdInactive?.includes(camera.id)) {
      discreteIndexParameter.cameraIdInactive = discreteIndexParameter.cameraIdInactive.filter(id => id !== camera.id);
    } else {
      discreteIndexParameter.cameraIdInactive.push(camera.id);
    }
  }

  isDiscreteIndexParameterInvisible(camera: Camera, discreteIndexParameter: DiscreteIndexParameter) {
    if (discreteIndexParameter.cameraIdInactive?.includes(camera.id)) {
      return true
    }
    return false
  }

  onDiscretendexValuesSelect(camera: Camera, parameter: Parameter, discreteIndexParameter: DiscreteIndexParameter) {
    if (discreteIndexParameter) {
      this.setCameraState(camera, parameter);
      this.commandService.sendIndexedCommand(camera, parameter, discreteIndexParameter);
    }
  }

  onDeletediscreteParameter(parameter: Parameter, index: number) {
    parameter.discreteIndex.splice(index, 1);
  }
}

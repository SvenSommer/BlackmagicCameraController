import { Component, Input } from '@angular/core'; // First, import Input
import { Parameter } from '../models/parameter-model';
import { ConfigFile } from '../models/config-model';
import { CameraState } from '../models/cameraState-model';

@Component({
  selector: 'app-parameter-settings',
  templateUrl: './parameter-settings.component.html',
  styleUrls: ['./parameter-settings.component.css']
})
export class ParameterSettingsComponent {
  @Input() currentParameter: Parameter;
  @Input() configData: ConfigFile;
  @Input() cameraStates: { [key: string]: CameraState } = {};

  private possibleDiscreteValues = ['int64', 'int32', 'int16', 'int8', 'fixed16']

  onCaptionChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const caption = target.value;
    if (caption) {
      this.currentParameter.caption = caption;
    }
  }

  isPossibleDiscreteParameter(parameter: Parameter): boolean {
    return this.possibleDiscreteValues.includes(parameter.type)
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

















}

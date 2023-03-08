import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Parameter } from '../models/parameter-model';
import { ParameterService } from '../services/parameter.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() groupsData: any;
  @Output() currentParameterChange: EventEmitter<Parameter> = new EventEmitter<Parameter>();

  constructor(private parameterService: ParameterService) { }

  configMode: boolean = true
  currentGroup: number;
  currentParameter: Parameter;

  changecurrentGroup(id: number) {
    this.currentGroup = id
  }

  toggleParameterVisibility(parameter: any) {
    parameter.visible = !parameter.visible;
  }

  changeCurrentParameter(parameter: Parameter) {
    this.parameterService.init(parameter);
    this.currentParameter = parameter;
    this.currentParameterChange.emit(this.currentParameter);
  }




}

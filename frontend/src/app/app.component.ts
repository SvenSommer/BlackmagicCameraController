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
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';


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
    private fb: FormBuilder
    ) { }

  public userParameterConfig : any;
  public maxRows: number;
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
    this.changeCurrentCamera(1);
    this.maxRows = Math.max(...this.groupsData.map((group: { parameters: any[]; }) => Math.max(...group.parameters.map(p => p.row))));
  }

  getParemetersbyRows(): Parameter[] {
    const flattened = this.groupsData
      .flatMap((group: { parameters: any }) => group.parameters)
      .filter((parameter: { visible: boolean }) => parameter.visible)
      .sort((a: { row: number }, b: { row: number }) => a.row - b.row);
  
  
    console.log('flattened:', flattened);
  
    return flattened
  

  }
  

newDiscreteValue: DiscreteParameter = new DiscreteParameter({});

isDiscreteParameter(parameter: Parameter): boolean {
  return parameter.discrete !== undefined;
}

onDiscreteValueSelect(value: DiscreteParameter) {
  // Set the selected value as the new value of the current parameter
  this.currentParameter.value = value.value;

  // Find the index of the selected value in the current parameter's discrete array
  const index = this.currentParameter.discrete.findIndex((v) => v.value === value.value);

  // Update the discrete array so that the selected value has a different color
  this.currentParameter.selectedValue = this.currentParameter.discrete.map((v) => {
    if (v.value === value.value) {
      this.currentParameter.selectedValue = true; // set the selected property to true
    } else {
      this.currentParameter.selectedValue = false; // set the selected property to false
    }
    return v;
  });
}

addDiscreteValue(parameter: Parameter): void {
  this.currentParameter.discrete.push(new DiscreteParameter(this.newDiscreteValue));
  this.newDiscreteValue = new DiscreteParameter({});
}

onDeleteDiscreteValue(parameter: Parameter, index: number): void {
  parameter.discrete.splice(index, 1);
}

onDiscreteValueChange(parameter: Parameter): void {
  // do something when a discrete value is changed
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

  changeCurrentCamera(id: number){
    this.currentCamera = id
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

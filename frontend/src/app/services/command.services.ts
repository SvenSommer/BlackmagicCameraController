import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Command } from '../models/command-model';
import { Parameter } from '../models/parameter-model';
import { Camera } from '../models/camera-model';
import { IndexCommand } from '../models/IndexCommand-model';
import { DiscreteIndexParameter } from '../models/discreteIndexParameter-model';

@Injectable({
  providedIn: 'root'
})
export class CommandService {
  constructor(private http: HttpClient) {
  }

  public sendCommand(camera: Camera, parameter: Parameter) {
    if (this.isValidParameterValue(parameter)) {

      const command = new Command(camera.id, parameter);
      this.sendCommand_for_value(command);
    }
  }

  public sendIndexedCommand(camera: Camera, parameter: Parameter, discreteIndexParameter: DiscreteIndexParameter) {
    if (this.isValidIndexedParameterValue(parameter)) {

      const command = new IndexCommand(camera.id, parameter, discreteIndexParameter);
      this.sendCommand_for_values(command);
    }
  }

  public isValidParameterValue(parameter: Parameter) {
    return parameter.value !== undefined || parameter.type === "void";
  }

  public isValidIndexedParameterValue(parameter: Parameter) {
    if (!parameter.discreteIndex)
      return false;
    else
      return true;

  }

  private sendCommand_for_value(command: Command) {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post<Command>(`${environment.baseUrl}command/value`, command, { withCredentials: false, headers: headers, observe: 'response' }).subscribe();
  }

  private sendCommand_for_values(command: IndexCommand) {
    console.log("values_command:", command);
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post<Command>(`${environment.baseUrl}command/values`, command, { withCredentials: false, headers: headers, observe: 'response' }).subscribe();
  }
}
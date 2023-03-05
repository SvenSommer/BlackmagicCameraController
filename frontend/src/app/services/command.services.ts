import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Command } from '../models/command-model';
import { Parameter } from '../models/parameter-model';
import { Camera } from '../models/camera-model';

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

    public isValidParameterValue(parameter: Parameter) {
      return parameter.value !== undefined || parameter.type === "void";
    }

    private sendCommand_for_value(command: Command) {
        let headers = new HttpHeaders({
            'Content-Type': 'application/json',
          });
        return this.http.post<Command>(`${environment.baseUrl}command/value`,command, { withCredentials: false, headers: headers, observe: 'response' }).subscribe();
    }
}
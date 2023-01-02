import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Command } from '../models/command-model';

@Injectable({
    providedIn: 'root'
  })
export class CommandService {
    constructor(private http: HttpClient) {
    }
    sendCommand_for_value(command: Command) {
        let headers = new HttpHeaders({
            'Content-Type': 'application/json',
          });
        return this.http.post<Command>(`${environment.baseUrl}command/value`,command, { withCredentials: false, headers: headers, observe: 'response' }).subscribe();
    }
}
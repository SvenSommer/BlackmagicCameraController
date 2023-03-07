import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ConfigFile } from '../models/config-model';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  constructor(private http: HttpClient) {
  }
  getConfig(): Observable<any> {
    let httpHeader = new HttpHeaders();
    httpHeader.set("Access-Control-Allow-Origin", "*");
    return this.http.get<any>(`${environment.baseUrl}config`, { withCredentials: false, headers: httpHeader, observe: 'response' });
  }

  saveConfig(configData: ConfigFile) {
    let httpHeader = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(`${environment.baseUrl}config`, configData, { withCredentials: false, headers: httpHeader, observe: 'response' });
  }
}
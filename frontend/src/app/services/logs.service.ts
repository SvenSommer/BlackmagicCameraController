import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogsService {
  constructor(private http: HttpClient) {}

  getLog(logName: string): Observable<string> {
    return this.http.get(`${environment.baseUrl}logs/${logName}`, { responseType: 'text' });
  }

   // Methode zum Abrufen des Status eines Dienstes
  getServiceStatus(serviceName: string): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}service-status/${serviceName}`);
  }
}

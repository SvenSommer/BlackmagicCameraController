import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShutdownService {
  constructor(private http: HttpClient) { }

  shutdownSystem(): Observable<any> {
    let httpHeader = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(`${environment.utilityBaseUrl}shutdown`, null, { headers: httpHeader });
  }

  getServiceStatus(serviceName: string): Observable<any> {
    return this.http.get<any>(`${environment.utilityBaseUrl}service-status/${serviceName}`);
  }

  restartService(serviceName: string): Observable<any> {
    return this.http.get<any>(`${environment.utilityBaseUrl}restart-service/${serviceName}`);
  }
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
    providedIn: 'root'
  })
export class ProtocolService {
    constructor(private http: HttpClient) {
    }
    getGroups(): Observable<any> {
        let httpHeader = new HttpHeaders();
        httpHeader.set("Access-Control-Allow-Origin", "*");
        return this.http.get<any>(`${environment.baseUrl}groups`, { withCredentials: false, headers: httpHeader, observe: 'response' });
    }

    saveGroups(groupsData: any): Observable<any> {
       const dataWithGroups = { groups: groupsData };
        let httpHeader = new HttpHeaders({
            'Content-Type': 'application/json'
          });
        return this.http.post<any>(`${environment.baseUrl}groups`, dataWithGroups, { withCredentials: false, headers: httpHeader, observe: 'response'});
      }
}
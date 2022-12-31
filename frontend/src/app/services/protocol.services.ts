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
    getProtocol(): Observable<any> {
        let httpHeader = new HttpHeaders();
        httpHeader.set("Access-Control-Allow-Origin", "*");
        return this.http.get<any>(`${environment.baseUrl}protocol`, { withCredentials: false, headers: httpHeader, observe: 'response' });
    }
}
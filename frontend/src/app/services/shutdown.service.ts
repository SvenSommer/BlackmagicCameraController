import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShutdownService {
  constructor(private http: HttpClient) {}

  shutdownSystem(): Observable<any> {
    let httpHeader = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(`${environment.baseUrl}shutdown`, null, { headers: httpHeader });
  }
}

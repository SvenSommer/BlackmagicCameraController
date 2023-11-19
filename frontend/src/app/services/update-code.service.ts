import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UpdateCodeService {
  constructor(private http: HttpClient) {}

  updateCode(): Observable<any> {
    return this.http.post<any>(`${environment.utilityBaseUrl}update-code`, {});
  }
}

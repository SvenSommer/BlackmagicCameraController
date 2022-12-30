import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = "CamerControler"
  totalAngularPackages: any;

  constructor(private http: HttpClient) { }

  ngOnInit() {      
      this.http.get<any>('https://api.npms.io/v2/search?q=scope:angular').subscribe(data => {
          this.totalAngularPackages = data.total;
      })
  }
}

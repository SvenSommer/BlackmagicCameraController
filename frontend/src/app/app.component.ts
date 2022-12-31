import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Parameter } from './models/parameter-model';
import { ConfigService } from './services/config.services';
import { ProtocolService } from './services/protocol.services';
import {MatSliderModule} from '@angular/material/slider';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = "CamerControler"
  constructor(private protocolService: ProtocolService, private configService: ConfigService) { }


  public groupsData: any;
  public camerasData: any;
  public currentCamera: any;
  public currentParameter: Parameter;
  public allowed_for_slider = ['int64','int32','int16','int8']

  ngOnInit() {      
      this.bindData();
      this.changeCurrentCamera(1)
  }

  changeCurrentCamera(id: number){
    this.currentCamera = id
  }

  changeCurrentParameter(parameter: Parameter){
    console.log(parameter)
    this.currentParameter = parameter
  }

  bindData() {
    this.protocolService.getProtocol().subscribe(
      (data) => {
        if (data) {
          if (data.body && data.status == 200) {
            this.groupsData = data.body.protocol.groups;
            console.log(  this.groupsData )
          }
        }
      },
      (error: HttpErrorResponse) => {
        console.log(error.name + ' ' + error.message);
      }
    );
    this.configService.getConfig().subscribe(
      (data) => {
        if (data) {
          if (data.body && data.status == 200) {
            this.camerasData = data.body.config;
            console.log(this.camerasData)
          }
        }
      },
      (error: HttpErrorResponse) => {
        console.log(error.name + ' ' + error.message);
      }
    );
  }
}

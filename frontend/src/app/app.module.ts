import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CameraComponent } from './camera/camera.component';
import { HttpClientModule } from '@angular/common/http';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatRadioModule } from '@angular/material/radio'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GroupByPipe } from './pipes/group-by.pipe';
import { ParameterSettingsComponent } from './parameter-settings/parameter-settings.component';
import { ControlpanelComponent } from './controlpanel/controlpanel.component';
import { NavbarComponent } from './navbar/navbar.component';
import { CommandService } from './services/command.services';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ProtocolService } from './services/protocol.services';

@NgModule({
  declarations: [
    AppComponent,
    CameraComponent,
    GroupByPipe,
    ParameterSettingsComponent,
    ControlpanelComponent,
    NavbarComponent,
    SidebarComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    MatSliderModule,
    MatRadioModule,
    MatSlideToggleModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    CommandService,
    ProtocolService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

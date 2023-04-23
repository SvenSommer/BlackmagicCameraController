// Angular imports
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Material imports
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';

// Custom module imports
import { AppRoutingModule } from './app-routing.module';

// Component imports
import { AppComponent } from './app.component';
import { CameraComponent } from './camera/camera.component';
import { ControlpanelComponent } from './controlpanel/controlpanel.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ParameterSettingsComponent } from './parameter-settings/parameter-settings.component';
import { DiscreteParameterComponent } from './parameter-settings/discrete-parameter/discrete-parameter.component';
import { IndexParameterComponent } from './parameter-settings/index-parameter/index-parameter.component';

// Pipe imports
import { GroupByPipe } from './pipes/group-by.pipe';

// Service imports
import { CommandService } from './services/command.services';
import { ProtocolService } from './services/protocol.services';
import { ParameterService } from './services/parameter.service';

@NgModule({
  declarations: [
    AppComponent,
    CameraComponent,
    ControlpanelComponent,
    NavbarComponent,
    SidebarComponent,
    ParameterSettingsComponent,
    DiscreteParameterComponent,
    IndexParameterComponent,
    GroupByPipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatSliderModule,
    MatRadioModule,
    MatSlideToggleModule
  ],
  providers: [
    CommandService,
    ProtocolService,
    ParameterService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
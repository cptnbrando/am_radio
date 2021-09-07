import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutComponent } from './about/about.component';
import { AppSettingsComponent } from './app-settings/app-settings.component';
import { ChatComponent } from './chat/chat.component';
import { StationsComponent } from './stations/stations.component';
import { VisualizerSettingsComponent } from './visualizer-settings/visualizer-settings.component';
import { ControlsComponent } from './controls.component';
import { MobileStationsComponent } from './stations/mobile-stations/mobile-stations.component';
import { CdkDetailRowDirective } from './stations/mobile-stations/row.directive';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';



@NgModule({
  declarations: [
    ControlsComponent,
    AboutComponent,
    AppSettingsComponent,
    ChatComponent,
    StationsComponent,
    MobileStationsComponent,
    VisualizerSettingsComponent,
    CdkDetailRowDirective
  ],
  imports: [
    CommonModule,
    MatTableModule,
    MatSlideToggleModule,
    FontAwesomeModule,
    FormsModule
  ],
  exports: [
    ControlsComponent
  ]
})
export class ControlsModule { }

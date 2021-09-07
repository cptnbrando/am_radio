import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaylistBarComponent } from './playlist-bar/playlist-bar.component';
import { StationBarComponent } from './station-bar/station-bar.component';
import { MenuComponent } from './menu.component';
import { ControlsModule } from './controls/controls.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    MenuComponent,
    PlaylistBarComponent,
    StationBarComponent
  ],
  imports: [
    CommonModule,
    ControlsModule,
    FontAwesomeModule
  ],
  exports: [
    MenuComponent
  ]
})
export class MenuModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSliderModule } from '@angular/material/slider';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PlayerComponent } from './player.component';
import { SeekerComponent } from './seeker/seeker.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    PlayerComponent,
    SeekerComponent
  ],
  imports: [
    CommonModule,
    MatSliderModule,
    FontAwesomeModule,
    BrowserAnimationsModule,
    FormsModule
  ],
  exports: [
    PlayerComponent
  ]
})
export class PlayerModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuModule } from './menu/menu.module';
import { HeaderModule } from './header/header.module';
import { PlayerModule } from './player/player.module';
import { VisualizerModule } from './visualizer/visualizer.module';
import { RadioPageComponent } from './radio-page.component';
import { DomWatcherDirective } from 'src/app/shared/directives/dom-watcher.directive';



@NgModule({
  declarations: [
    RadioPageComponent,
    DomWatcherDirective
  ],
  imports: [
    CommonModule,
    MenuModule,
    HeaderModule,
    PlayerModule,
    VisualizerModule
  ],
  exports: [
    RadioPageComponent
  ]
})
export class RadioPageModule { }

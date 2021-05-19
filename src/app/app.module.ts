import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { VisualizerComponent } from './visualizer/visualizer.component';
import { PlayerComponent } from './player/player.component';
import { HeaderComponent } from './header/header.component';
import { ControlsComponent } from './controls/controls.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpClientModule } from '@angular/common/http';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './http-interceptors/token.interceptor';
import { RouterModule } from '@angular/router';
import { PlaylistBarComponent } from './playlist-bar/playlist-bar.component';
import { StationBarComponent } from './station-bar/station-bar.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { RadioPageComponent } from './radio-page/radio-page.component';
import { AppRoutingModule } from './app-routing.module';
import { DomWatcherDirective } from './dom-watcher.directive';

@NgModule({
  declarations: [
    AppComponent,
    VisualizerComponent,
    PlayerComponent,
    HeaderComponent,
    ControlsComponent,
    PlaylistBarComponent,
    StationBarComponent,
    LandingPageComponent,
    RadioPageComponent,
    DomWatcherDirective
  ],
  imports: [
    BrowserModule,
    FontAwesomeModule,
    HttpClientModule,
    RouterModule.forRoot([
      {path: '', component: LandingPageComponent},
      {path: 'app', component: RadioPageComponent}
    ]),
    AppRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

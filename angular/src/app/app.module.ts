import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { VisualizerComponent } from './components/radio-page/visualizer/visualizer.component';
import { PlayerComponent } from './components/radio-page/player/player.component';
import { HeaderComponent } from './components/radio-page/header/header.component';
import { ControlsComponent } from './components/radio-page/controls/controls.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './shared/interceptors/token.interceptor';
import { RouterModule } from '@angular/router';
import { PlaylistBarComponent } from './components/radio-page/playlist-bar/playlist-bar.component';
import { StationBarComponent } from './components/radio-page/station-bar/station-bar.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { RadioPageComponent } from './components/radio-page/radio-page.component';
import { AppRoutingModule } from './app-routing.module';
import { DomWatcherDirective } from './shared/directives/dom-watcher.directive';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table'; 
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SeekerComponent } from './components/radio-page/player/seeker/seeker.component';
import { ChatComponent } from './components/radio-page/controls/chat/chat.component';
import { AppSettingsComponent } from './components/radio-page/controls/app-settings/app-settings.component';
import { VisualizerSettingsComponent } from './components/radio-page/controls/visualizer-settings/visualizer-settings.component';
import { AboutComponent } from './components/radio-page/controls/about/about.component';
import { StationsComponent } from './components/radio-page/controls/stations/stations.component';

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
    DomWatcherDirective,
    SeekerComponent,
    ChatComponent,
    VisualizerSettingsComponent,
    AppSettingsComponent,
    AboutComponent,
    StationsComponent
  ],
  imports: [
    BrowserModule,
    FontAwesomeModule,
    HttpClientModule,
    RouterModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatTableModule
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

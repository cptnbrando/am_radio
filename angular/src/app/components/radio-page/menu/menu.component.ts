import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Station } from 'src/app/shared/models/station.model';
import { Preset } from './controls/visualizer-settings/visualizer-settings.component';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  @Input() showPlaylistBar: boolean = false;
  @Input() showStationBar: boolean = false;
  @Input() showControls: boolean = false;

  @Input() user : any;
  @Input() userPlaylists: any[] = [];

  @Input() isMobile: boolean = false;
  @Input() isLoading: boolean = true;

  @Input() currentStation: Station = new Station;
  @Input() stationNum: number = 0;

  @Input() selectedPlaylist: any = null;
  @Input() selectedPlaylistTracks: any = null;

  @Input() selectedPreset: number = 3;

  @Output() changePlaylistEvent = new EventEmitter<any>();
  @Output() playPlaylistEvent = new EventEmitter<any>();
  @Output() playTrackEvent = new EventEmitter<any>();
  @Output() toggleLoadingEvent = new EventEmitter<boolean>();

  @Output() preset: number = 3;
  @Output() presetEvent = new EventEmitter<number>();
  @Output() changeStationEvent = new EventEmitter<number>();
  @Input() presets: Array<Preset> = [];
  @Output() fullscreenEvent = new EventEmitter<boolean>();
  @Output() showSketchInfoEvent = new EventEmitter<boolean>();
  @Output() changeDeviceEvent = new EventEmitter<any>();

  @Output() createdStationEvent = new EventEmitter<any>();
  @Output() toggleNavEvent = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void {
  }

  toggleNav(menuNum: number): void {
    this.toggleNavEvent.emit(menuNum);
  }

  changePlaylist(event: any): void {
    this.changePlaylistEvent.emit(event);
  }

  playTrack(event: any): void {
    this.playTrackEvent.emit(event);
  }

  toggleLoading(event: any): void {
    this.toggleLoadingEvent.emit(event);
  }

  changeStation(event: any): void {
    this.changeStationEvent.emit(event);
  }

  fullscreen(event: any): void {
    this.fullscreenEvent.emit(event);
  }

  changeDevice(event: any): void {
    this.changeDeviceEvent.emit(event);
  }

  changeSketchInfo(event: any): void {
    this.showSketchInfoEvent.emit(event);
  }

  onCreatedStation(event: any): void {
    this.createdStationEvent.emit(event);
  }

  playPlaylist(): void {
    this.playPlaylistEvent.emit();
  }

}

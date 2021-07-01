import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faArrowLeft, faPlay } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-playlist-bar',
  templateUrl: './playlist-bar.component.html',
  styleUrls: ['./playlist-bar.component.scss']
})
export class PlaylistBarComponent implements OnInit {

  faArrowLeft = faArrowLeft;
  faPlay = faPlay;

  @Input() showPlaylistBar: boolean = false;

  @Input() user : any;
  @Input() userPlaylists: any[] = [];

  @Input() selectedPlaylist: any = null;
  @Input() selectedPlaylistTracks: any = null;
  @Output() changePlaylistEvent = new EventEmitter<any>();

  @Output() playPlaylistEvent = new EventEmitter<any>();
  @Output() playTrackEvent = new EventEmitter<any>();

  @Output() toggleLoadingEvent = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
  }

  clickPlaylist(playlist: any): void{
    this.toggleLoadingEvent.emit(true);
    if(playlist != this.selectedPlaylist) {
      this.changePlaylistEvent.emit(playlist);
    }
  }

  back(): void{
    this.changePlaylistEvent.emit(null);
    this.selectedPlaylistTracks = null;
  }

  playTrack(track: any): void {
    this.toggleLoadingEvent.emit(true);
    this.playTrackEvent.emit(track);
  }

  playPlaylist(): void {
    this.toggleLoadingEvent.emit(true);
    this.playPlaylistEvent.emit();
  }

}

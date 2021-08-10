import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faArrowLeft, faPlay } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-playlist-bar',
  templateUrl: './playlist-bar.component.html',
  styleUrls: ['./playlist-bar.component.scss'],
  animations: [
    trigger('fadeSlideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-100px)' }),
        animate('200ms', style({ opacity: 1, transform: 'translateX(10px)' })),
      ]),
      transition(':leave', [
        animate('200ms', style({ opacity: 0, transform: 'translateX(-100px)' })),
      ]),
    ]),
  ]
})
export class PlaylistBarComponent implements OnInit {

  faArrowLeft = faArrowLeft;
  faPlay = faPlay;

  @Input() showPlaylistBar: boolean = false;

  @Input() user : any;
  @Input() userPlaylists: any[] = [];

  @Input() isLoading: boolean = false;

  @Input() selectedPlaylist: any = null;
  @Input() selectedPlaylistTracks: any = null;
  @Output() changePlaylistEvent = new EventEmitter<any>();

  @Output() playPlaylistEvent = new EventEmitter<any>();
  @Output() playTrackEvent = new EventEmitter<any>();

  @Output() toggleLoadingEvent = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
  }

  clickPlaylist(playlist: any): void {
    if(playlist != this.selectedPlaylist) {
      this.changePlaylistEvent.emit(playlist);
    }
  }

  back(): void {
    this.changePlaylistEvent.emit(null);
    this.selectedPlaylistTracks = null;
  }

  playTrack(event: any, track: any): void {
    if(!this.isLoading) {
      let element = event.srcElement || event.target;
      element.style.borderColor = "red";
      this.playTrackEvent.emit([track, element]);
    }
  }

  playPlaylist(): void {
    if(!this.isLoading) {
      this.playPlaylistEvent.emit();
    }
  }

}

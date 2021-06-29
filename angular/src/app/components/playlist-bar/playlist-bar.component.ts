import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { SpotifyService } from 'src/app/services/spotify.service';
import { faArrowLeft, faPlay } from '@fortawesome/free-solid-svg-icons';
import { SpotifyPlayerService } from 'src/app/services/spotify-player.service';

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

  @Input() selectedPlaylist: any;
  @Output() changePlaylistEvent = new EventEmitter<any>();

  @Output() playPlaylistEvent = new EventEmitter<any>();
  @Output() playTrackEvent = new EventEmitter<any>();

  selectedTracks: any = null;

  constructor(private spotifyService: SpotifyService, private playerService: SpotifyPlayerService) { }

  ngOnInit(): void {
  }

  clickPlaylist(playlist: any): void{
    if(playlist != this.selectedPlaylist) {
      this.changePlaylistEvent.emit(playlist);

      this.spotifyService.getPlaylistTracks(playlist.id).subscribe(data => {
        if(data) {
          this.selectedTracks = data;
        }
      });
    }
  }

  back(): void{
    this.changePlaylistEvent.emit(null);
    this.selectedTracks = null;
  }

  playTrack(track: any): void {
    this.playTrackEvent.emit(track);
  }

  playPlaylist(): void {
    this.playPlaylistEvent.emit();
  }

}

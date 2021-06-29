import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { SpotifyService } from 'src/app/services/spotify.service';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-playlist-bar',
  templateUrl: './playlist-bar.component.html',
  styleUrls: ['./playlist-bar.component.scss']
})
export class PlaylistBarComponent implements OnInit {

  faArrowLeft = faArrowLeft;

  @Input() showPlaylistBar: boolean = false;

  @Input() user : any;
  @Input() userPlaylists: any[] = [];

  @Input() selectedPlaylist: any;
  @Output() changePlaylistEvent = new EventEmitter<any>();
  selectedTracks: any = null;

  constructor(private spotifyService: SpotifyService) { }

  ngOnInit(): void {
  }

  loadUserPlaylists(): void{
    
  }

  clickPlaylist(playlist: any): void{
    console.log(playlist);
    if(playlist != this.selectedPlaylist) {
      this.changePlaylistEvent.emit(playlist);

      this.spotifyService.getPlaylistTracks(playlist.id).subscribe(data => {
        if(data)
        {
          this.selectedTracks = data;
          console.log(data);
        }
      });
    }
  }

  back(): void{
    this.changePlaylistEvent.emit(null);
    this.selectedTracks = null;
  }

}

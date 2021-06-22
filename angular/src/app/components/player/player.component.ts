import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { SpotifyPlayerService } from '../../services/spotify-player.service';
import { SpotifyService } from '../../services/spotify.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, OnChanges {
  faPlay = faPlay;
  faPause = faPause;

  @Input() stationNum: number = 0;

  // Setting bars
  @Input() showPlaylistBar: boolean = false;
  @Input() showStationBar: boolean = false;

  // Spotify data
  @Input() isPlaying: boolean = false;
  @Input() currentDevice: any = {};
  @Input() currentlyPlaying: any = {};
  @Input() position: number = 0;

  @Output() toggleBarEvent = new EventEmitter<number>();
  @Output() isPlayingEvent = new EventEmitter<boolean>();

  constructor(private spotifyService: SpotifyService, private playerService: SpotifyPlayerService) {

  }
  
  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }

  ngOnInit(): void 
  {
    // First, set default values
    this.setDefaults();
  }

  // Player values set when nothing is playing
  setDefaults(): void {
    this.currentDevice.name = "No Current Device!";
    
    this.currentlyPlaying.album = {};
    this.currentlyPlaying.album.images = [5];
    this.currentlyPlaying.album.images[0] = {};
    this.currentlyPlaying.album.images[0].url = "";
    this.currentlyPlaying.artists = [5];
    this.currentlyPlaying.artists[0] = {};
    this.currentlyPlaying.artists[0].name = "No Artist";
    this.currentlyPlaying.name = "Nothing Playing";
  }

  // This will get the current player and set the data to the UI
  setPlayerData(): void {
    this.playerService.getPlayer().subscribe(data => {
      if(data)
      {
        // Set the data
        this.currentlyPlaying = data.item;
        this.currentDevice = data.device;

        if(data.is_playing)
        {
          this.isPlayingEvent.emit(true);
        }

        console.log(data);
      }
    });
  }

  toggleBar(bar: number) {
    this.toggleBarEvent.emit(bar);
  }

  togglePlay() {
    if(this.isPlaying)
    {
      // The player is playing, so we want to pause it!
      this.playerService.pause().subscribe(data => {
        // this.isPlayingEvent.emit(data);
      });
    }
    else
    {
      // The player is not playing, so we want to play it!
      this.playerService.play().subscribe(data => {
        // this.isPlayingEvent.emit(data);
      });
    }
  }
}

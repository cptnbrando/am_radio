import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { faAngleLeft, faAngleRight, faPause, faPlay, faRandom, faRecycle, faSync } from '@fortawesome/free-solid-svg-icons';
import { Station } from 'src/app/shared/models/station.model';
import { SpotifyPlayerService } from '../../services/spotify-player.service';
import { SpotifyService } from '../../services/spotify.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, OnChanges {
  // FontAwesome icons
  faPlay = faPlay;
  faPause = faPause;
  faAngleRight = faAngleRight;
  faAngleLeft = faAngleLeft;
  faRandom = faRandom;
  faSync = faSync;
  faRecycle = faRecycle;

  @Input() stationNum: number = 0;
  @Input() currentStation: any = {};

  // Setting bars
  @Input() showPlaylistBar: boolean = false;
  @Input() showStationBar: boolean = false;

  // Spotify data
  @Input() user: any = {};
  @Input() isPlaying: boolean = false;
  @Input() currentDevice: any = {};
  @Input() currentlyPlaying: any = {};
  @Input() position: number = 0;

  @Input() shuffle: boolean = false;
  @Input() repeat: number = 0;

  @Output() toggleBarEvent = new EventEmitter<number>();
  @Output() isPlayingEvent = new EventEmitter<boolean>();

  constructor(private spotifyService: SpotifyService, private playerService: SpotifyPlayerService) {

  }
  
  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.repeat);
  }

  ngOnInit(): void 
  {
    // First, set default values
    this.setDefaults();
  }

  // Player values set when nothing is playing
  setDefaults(): void {
    this.currentDevice.name = "No Current Device!";
    this.currentStation.stationName = "No Station!";
    
    this.currentlyPlaying.album = {};
    this.currentlyPlaying.album.images = [5];
    this.currentlyPlaying.album.images[0] = {};
    this.currentlyPlaying.album.images[0].url = "/assets/img/default.png";
    this.currentlyPlaying.album.name = "No Album"

    this.currentlyPlaying.artists = [5];
    this.currentlyPlaying.artists[0] = {};
    this.currentlyPlaying.artists[0].name = "No Artist";
    
    this.currentlyPlaying.name = "Nothing Playing";
  }

  // This will get the current player and set the data to the UI
  setPlayerData(): void {
    this.playerService.getPlayer().subscribe(data => {
      if(data) {
        // Set the data
        this.currentlyPlaying = data.item;
        this.currentDevice = data.device;

        if(data.is_playing)
        {
          this.isPlayingEvent.emit(true);
        }
      }
    });
  }

  toggleBar(bar: number) {
    this.toggleBarEvent.emit(bar);
  }

  togglePlay() {
    if(this.isPlaying) {
      // The player is playing, so we want to pause it!
      this.playerService.pause().subscribe();
    }
    else {
      // The player is not playing, so we want to play it!
      this.playerService.play().subscribe();
    }
  }

  skip() {
    this.playerService.next().subscribe();
  }

  back() {
    this.playerService.previous().subscribe();
  }

  shuffleChange(): void {
    this.playerService.shuffle(!this.shuffle).subscribe();
  }

  repeatChange(): void {
    switch(this.repeat) {
      case 0:
        this.playerService.repeat("context").subscribe();
        break;
      case 1:
        this.playerService.repeat("track").subscribe();
        break;
      case 2:
        this.playerService.repeat("off").subscribe();
        break;
    }
  }
}

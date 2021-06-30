import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faAngleLeft, faAngleRight, faPause, faPlay, faRandom, faRecycle, faSync, faVolumeDown, faVolumeMute, faVolumeOff, faVolumeUp } from '@fortawesome/free-solid-svg-icons';
import { SpotifyPlayerService } from '../../services/spotify-player.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  // FontAwesome icons
  faPlay = faPlay;
  faPause = faPause;
  faAngleRight = faAngleRight;
  faAngleLeft = faAngleLeft;
  faRandom = faRandom;
  faSync = faSync;
  faRecycle = faRecycle;

  faVolumeUp = faVolumeUp;
  faVolumeOff = faVolumeOff;
  faVolumeMute = faVolumeMute;
  faVolumeDown = faVolumeDown;

  @Input() stationNum: number = 0;
  @Input() currentStation: any = {};
  @Input() playingPlaylist: any = {};

  // Setting bars
  @Input() showPlaylistBar: boolean = false;
  @Input() showStationBar: boolean = false;

  // Spotify data
  @Input() user: any = {};
  @Input() isPlaying: boolean = false;
  @Input() currentDevice: any = {};
  @Input() currentlyPlaying: any = {};
  @Input() position: number = 0;
  volume: number = 100;

  @Input() shuffle: boolean = false;
  @Input() repeat: number = 0;

  @Output() toggleBarEvent = new EventEmitter<number>();
  @Output() isPlayingEvent = new EventEmitter<boolean>();
  @Output() toggleLoadingEvent = new EventEmitter<boolean>();

  constructor(private playerService: SpotifyPlayerService) {

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
    this.toggleLoadingEvent.emit(true);

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
    this.toggleLoadingEvent.emit(true);
    this.playerService.next().subscribe();
  }

  back() {
    this.toggleLoadingEvent.emit(true);
    this.playerService.previous().subscribe();
  }

  shuffleChange(): void {
    this.toggleLoadingEvent.emit(true);
    this.playerService.shuffle(!this.shuffle).subscribe();
  }

  repeatChange(): void {
    this.toggleLoadingEvent.emit(true);
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

  changeVolume(): void {
    this.playerService.volume(this.volume).subscribe();
  }

  toggleMute(): void {
    if(this.volume > 0) {
      this.volume = 0;
    }
    else {
      this.volume = 100;
    }
    this.playerService.volume(this.volume).subscribe();
  }
}

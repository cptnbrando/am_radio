import { Component, Input, OnInit, Output } from '@angular/core';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { ScriptService } from '../script.service';
import { SpotifyPlayerService } from '../spotify-player.service';
import { SpotifyService } from '../spotify.service';

@Component({
  selector: 'app-radio-page',
  templateUrl: './radio-page.component.html',
  styleUrls: ['./radio-page.component.scss']
})
export class RadioPageComponent implements OnInit {

  faSpotify = faSpotify;

  // This will hold a spotify uri for the logged in user
  @Input() user: any = {};

  // This will hold an array of playlist uris for the user
  @Output() userPlaylists: any = {};

  // What station the user is on, begins on 0
  @Output() stationNum: number = 0;

  // Current track information
  @Output() currentlyPlaying: any = {};
  @Output() isPlaying: boolean = false;

  // The device currently playing
  @Output() currentDevice: any = {};
  @Output() devices: any = {};

  // Whether the spotify sdk is ready or not
  // Uses a directive watcher to watch for the canvas state attribute to change to true
  @Output() playerReady: boolean = false;

  // These will toggle the control panes
  @Output() showPlaylistBar: boolean = false;
  @Output() showStationBar: boolean = false;
  @Output() showControls: boolean = false;

  public static accessToken: string = "";

  constructor(private spotifyService: SpotifyService, private playerService: SpotifyPlayerService, private script: ScriptService) 
  {
    // Immediately check for an access token
    this.checkTokens();
  }

  ngOnInit() {
    // When we load up, get the User
    this.setUser();

    // Also get the UserPlaylists
    this.setPlaylists();

    // Also get all available devices
    this.setDevices();
  }

  setPlaylists(): any {
    this.spotifyService.getUserPlaylists().subscribe(data => {
      this.userPlaylists = data;
      return data;
    });
  }

  setUser(): any {
    this.spotifyService.getUser().subscribe(data => {
      this.user = data;
      return data;
    });
  }

  setDevices(): any {
    this.spotifyService.getDevices().subscribe(data => {
      this.devices = data;
      return data;
    });
  }

  setCurrentDevice(deviceID: string) {
    this.playerService.playOn(deviceID).subscribe(data => {
      if(data)
      {
        this.currentDevice = data;
      }
    })
  }

  // This is the event handler for the js script event
  handleDomChange(event: any) {
    console.log("SDK Event found");
    console.log(event);
    this.playerReady = event.returnValue;
    
    // Once the radio player is ready, we should prompt the user to swap to the new player
    // ...or we could change it automatically if there's nothing playing rn
    if(this.isPlaying)
    {
      // Device toggling done via Station Bar
      this.toggleBar(1);
      this.setPlayerData();
    }
    else
    {
      // Get am_radio (this will find it and set it as the active player)
      this.playerService.getAMRadio().subscribe(data => {
        if(data)
        {
          console.log("Found am_radio");
          console.log(data);
          this.currentDevice = data;
        }

        // Attempt to play most recently played track on am_radio
        this.spotifyService.getRecentlyPlayedTrack().subscribe(data => {
          if(data)
          {
            console.log("Found most recently played track");
            console.log(data);
            this.playerService.playTrack(data.uri).subscribe(data => {
              if(data)
              {
                // We have successfully played the track in the browser, now we just have to update the UI
                console.log("playing...");
                this.isPlaying = true;
                this.setPlayerData();
              }
            });
          }
        });
      });
    }
  }

  getInfoFromPlayer(): void {
    let canvas = document.querySelector("canvas");
    // this.currentlyPlaying.
  }

  // This will get the current player and set the data to the UI
  setPlayerData(): void {
    this.playerService.getPlayer().subscribe(data => {
      if(data)
      {
        // Set the data
        this.currentlyPlaying = data.item;
        this.currentDevice = data.device;

        console.log(data);
      }
    });
  }

  toggleBar(bar: number)
  {
    // Playlist bar = 0, Station bar = 1, Controls panel = 2
    switch(bar)
    {
      case 0:
        this.showPlaylistBar = !this.showPlaylistBar;
        break;
      case 1:
        this.showStationBar = !this.showStationBar;
        break;
      case 2:
        this.showControls = !this.showControls;
        break;
    }
  }

  changeStation(stationNum: number)
  {
    this.stationNum = stationNum;
  }

  togglePlayback()
  {
    this.isPlaying = !this.isPlaying;
  }

  async checkTokens()
  {
    await this.spotifyService.checkTokens().subscribe(data => {
      if(data == null)
      {
        // No access token, so we go away!
        window.location.replace(this.spotifyService.webURL);
      }
      if(data.message)
      {
        // We have to set it to local storage so the playback sdk js script can get it
        localStorage.setItem("accessToken", data.message);

        // We've got an access token, so let's make a spotify web sdk player
        this.loadPlayerScript();
      }
    }, error => {
      // On error, go away!
      window.location.replace(this.spotifyService.webURL);
    });
  }

  loadPlayerScript(): void {
    // We've got an access token, so let's make a spotify web sdk player
    this.script.load('spotifyPlaybackSDK', 'spotifyPlayer').then(data => {
      console.log('scripts loaded ', data);
    }).catch(error => console.log(error));
  }

}

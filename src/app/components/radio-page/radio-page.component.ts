import { Component, Input, OnInit, Output } from '@angular/core';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { WebSocketAPI } from 'src/app/api/WebSocketAPI';
import { AppComponent } from 'src/app/app.component';
import { RadioService } from 'src/app/services/radio.service';
import { Station } from 'src/app/shared/models/station.model';
import { ScriptService } from '../../services/script.service';
import { SpotifyPlayerService } from '../../services/spotify-player.service'
import { SpotifyService } from '../../services/spotify.service';

@Component({
  selector: 'app-radio-page',
  templateUrl: './radio-page.component.html',
  styleUrls: ['./radio-page.component.scss']
})
export class RadioPageComponent implements OnInit {

  faSpotify = faSpotify;

  wsAPI: WebSocketAPI;

  // This will hold a spotify uri for the logged in user
  @Input() user: any = {};

  // This will hold the selected playlist
  @Output() selectedPlaylist: any = null;

  // This will hold an array of playlist uris for the user
  @Output() userPlaylists: any = {};

  // What station the user is on, begins on 0
  @Output() stationNum: number = 0;
  @Output() currentStation: Station = null;

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

  // This is the canvas element
  // We update attributes of it to display changes to the player
  canvas: any;

  public static accessToken: string = "";

  constructor(private spotifyService: SpotifyService, private playerService: SpotifyPlayerService, private script: ScriptService, private radioService: RadioService) {
    // Immediately check for valid tokens from the server
    // This function will redirect the user back to the homepage if credentials can't be found
    if(!this.checkTokens())
    {
      window.location.replace(AppComponent.webURL);
      throw new Error;
    }

    this.wsAPI = new WebSocketAPI(this);
  }

  ngOnInit() {
    // When we load up, set the User
    this.setUser();

    // Also set the UserPlaylists
    this.setPlaylists();

    // // Also set userDevices
    // this.setDevices();

    // // Also set currentDevice
    // this.getCurrentDevice();

    this.canvas = document.querySelector("canvas");
  }

  // Get the user's playlists and set them to the userPlaylists variable
  setPlaylists(): any {
    this.spotifyService.getUserPlaylists().subscribe(data => {
      if(data) this.userPlaylists = data;
      return data;
    });
  }

  // Get the user and set them to the user variable
  setUser(): any {
    this.spotifyService.getUser().subscribe(data => {
      if(data) this.user = data;
      return data;
    });
  }

  // Get the user's devices and set them to the userDevices variable
  setDevices(): any {
    this.spotifyService.getDevices().subscribe(data => {
      if(data) this.devices = data;
      return data;
    });
  }

  // Set the user's current device to a different one
  setCurrentDevice(deviceID: string): any {
    this.playerService.playOn(deviceID).subscribe(data => {
      if(data) this.currentDevice = data;
      return data;
    });
  }

  // Get the user's current device and set it to the currentDevice variable
  getCurrentDevice(): any {
    this.playerService.getCurrentDevice().subscribe(data => {
      if(data) this.currentDevice = data;
      console.log(data);
      this.isPlaying = this.currentDevice.is_playing;
      return data;
    });
  }

  // This is the event handler for the playerReady sdk js script events
  // It uses dom-watcher to watch the canvas element for attribute changes, updated by the spotifyPlayerSDK.js in /assets
  onPlayerReady(event: any) {
    console.log("onPlayerReady");
    this.playerReady = event.returnValue;
    
    // Once the radio player is ready, we should prompt the user to swap to the new player
    // ...or we could change it automatically if there's nothing playing rn
    if(this.isPlaying)
    {
      // Device toggling done via Station Bar
      this.setPlayerData();

      // Also set userDevices
      this.setDevices();

      // Also set currentDevice
      this.getCurrentDevice();

      // We get the currently playing player
      this.playerService.getPlayer().subscribe(data => {
        if(data) this.currentDevice = data;
      });
    }
    else
    {
      // If nothing is playing, we get am_radio from the server, then attempt to play the most recently played track
      this.beginAMRadio();
    }
  }

  beginAMRadio(): void {
    console.log("beginAMRadio()");

    // So that the station bar doesn't tweak from missing fields
    this.currentStation = new Station();

    // Get am_radio (This server endpoint find am_radio and sets it as the active device in the Spotify API)
    this.playerService.getAMRadio().subscribe(data => {
      if(data)
      {
        console.log("Found am_radio");
        console.log(data);
        // If found, set it as the active player in the front end aka this component
        this.currentDevice = data;

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
      }
    });
  }

  // Event callback for Spotify SDK script
  onPlaybackChange(event: any): void {
    console.log("playback change event handler");
    console.log(event);

    this.isPlaying = !(this.canvas.getAttribute("paused") === "true");
  }

  // Event callback for Spotify SDK script
  onTrackChange(event: any): void {
    console.log("track change event handler");
    this.setPlayerData();
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

  // Called when the station number is changed
  setStation(): void {
    this.radioService.getStation(this.stationNum).subscribe(data => {
      if(data) this.currentStation = data;
    });

    // We should connect to the websocket here
    this.wsAPI._connect(this.stationNum);
  }

  createdStation(): void {
    this.setStation();
  }

  toggleBar(bar: number): void
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

  changePlaylist(playlist: any)
  {
    console.log("changePlaylist");
    console.log(playlist);
    this.selectedPlaylist = playlist;
  }

  // This is called by the EventEmitter in the header component
  changeStation(stationNum: number)
  {
    this.stationNum = stationNum;

    // Pause the player to begin
    if(this.isPlaying){ 
      this.playerService.pause().subscribe(data => {
        console.log(data);
      });
    }

    // BeginAMRadio on station 000
    if(stationNum === 0)
    {
      this.beginAMRadio();
      return;
    }

    // Get station at given number
    this.radioService.getStation(stationNum).subscribe(data => {
      // This route checks if it exists first, if not it returns back null
      if(data)
      {
        this.currentStation = data;
      }
      else
      {
        this.currentStation = new Station(stationNum);
        if(!this.showPlaylistBar) this.toggleBar(0);
        if(!this.showStationBar) this.toggleBar(1);
      }
    });

  }

  async checkTokens(): Promise<boolean>
  {
    await this.spotifyService.checkTokens().subscribe(data => 
    {
      if(data == null)
      {
        // No access token, so we go away!
        window.location.replace(AppComponent.webURL);
        return false;
      }
      else
      {
        // We have to set it to local storage so the playback sdk js script can get it
        localStorage.setItem("accessToken", data.message);

        // We've got an access token, so let's make a spotify web sdk player
        this.loadPlayerScript();

        return true;
      }
    }, error => {
      // On error, go away!
      window.location.replace(AppComponent.webURL);
      return false;
    });

    return false;
  }

  loadPlayerScript(): void {
    // We've got an access token, so let's make a spotify web sdk player
    this.script.load('spotifyPlaybackSDK', 'spotifyPlayer').then(data => {
      console.log('scripts loaded ', data);
    }).catch(error => console.log(error));
  }

  handleNext(station: any): void {

  }

  handleListener(listeners: any): void {

  }

}

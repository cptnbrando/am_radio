import { Component, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
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
export class RadioPageComponent implements OnInit, OnChanges {

  faSpotify = faSpotify;

  // This will hold a spotify uri for the logged in user
  @Output() user: any = {};

  // This will hold the selected playlist
  @Output() selectedPlaylist: any = null;

  // This will hold an array of playlist uris for the user
  @Output() userPlaylists: any = {};

  // What station the user is on, begins on 0
  @Output() stationNum: number = 0;
  @Output() currentStation: any = {};

  // Spotify track information
  @Output() currentlyPlaying: any = {};
  @Output() isPlaying: boolean = false;
  @Output() position: number = 0;
  next: any = "";
  @Output() shuffle: boolean = false;
  @Output() repeat: number = 0;

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
    if(!this.checkTokens()) {
      window.location.replace(AppComponent.webURL);
      throw new Error;
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    throw new Error('Method not implemented.');
  }

  ngOnInit() {
    // When we load up, set the User
    this.setUser();

    // Also set the UserPlaylists
    this.setPlaylists();

    this.canvas = document.querySelector("canvas");
  }

  // Get the user's playlists and set them to the userPlaylists variable
  setPlaylists(): void {
    this.spotifyService.getUserPlaylists().subscribe(data => {
      if(data) this.userPlaylists = data;
    });
  }

  // Get the user and set them to the user variable
  setUser(): void {
    this.spotifyService.getUser().subscribe(data => {
      if(data) this.user = data;
    });
  }

  // Get the user's devices and set them to the devices variable
  setDevices(): void {
    this.spotifyService.getDevices().subscribe(data => {
      if(data) this.devices = data;
    });
  }

  // Set the user's current device to a different one
  playOnDevice(deviceID: string): void {
    this.playerService.playOn(deviceID).subscribe(data => {
      if(data) this.currentDevice = data;
    });
  }

  // Get the user's current device and set it to the currentDevice variable
  getCurrentDevice(): void {
    this.playerService.getCurrentDevice().subscribe(data => {
      if(data) {
        this.currentDevice = data;
        this.isPlaying = this.currentDevice.is_playing;
      }
    });
  }

  // This is the event handler for the playerReady sdk js script events
  // It uses dom-watcher to watch the canvas element for attribute changes, updated by the spotifyPlayerSDK.js in /assets
  onPlayerReady(event: any) {
    this.playerReady = event.returnValue;
    
    // Once the radio player is ready, we should prompt the user to swap to the new player
    // ...or we could change it automatically if there's nothing playing rn
    if(this.isPlaying) {
      // Device toggling done via Station Bar
      this.setPlayerData();

      // Also set userDevices
      // this.setDevices();

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
    // So that the station bar doesn't tweak from missing fields
    this.currentStation = new Station();

    // Get am_radio (This server endpoint find am_radio and sets it as the active device in the Spotify API)
    this.playerService.getAMRadio().subscribe(data => {
      if(data) {
        // If found, set it as the active player
        this.currentDevice = data;

        // Attempt to play the last played Playlist
        this.playerService.startAMRadio().subscribe();
      }
    });
  }

  playRecentTrack(): void {
    // Attempt to play most recently played track on am_radio
    this.spotifyService.getRecentlyPlayed().subscribe(data => {
      if(data) {
        this.playerService.playTrack(data.uri).subscribe(data => {
          if(data) {
            // We have successfully played the track in the browser, now we just have to update the UI
            console.log("playing recent track...");
            this.isPlaying = true;
          }
        });
      }
    });
  }

  /**
   * Gets 20 of the most recently played tracks and adds them to the queue one by one
   */
  playRecentlyPlayedTracks(): void {
    this.spotifyService.getRecentlyPlayedTracks().subscribe(data => {
      console.log("playRecentlyPlayedTracks");
      // add each item to the queue
      data.forEach((item: { track: { type: string; uri: string; }; }) => {
        if(item.track.type === "TRACK") {
          console.log(item.track);
          this.playerService.addToQueue(item.track.uri).subscribe();
        }
      });
      
      // skip to the next track and begin the queue
      this.playerService.next().subscribe();
    });
  }

  /**
   * Plays the last played playlist
   * Sets shuffle to on and skips to next track
   */
  playLastPlayedPlaylist(): void {
    this.spotifyService.getUserPlaylists().subscribe(data => {
      let playlist = data[0];
      console.log(playlist);
      
      this.playerService.playPlaylist(playlist.uri).subscribe();

      // toggle shuffle and repeat and skip to the next track

      
      // skip to the next track and begin the queue
      // this.playerService.next().subscribe();
    });
  }

  // Event callback for Spotify SDK script
  onPlaybackChange(event: any): void {
    // console.log("playback change event handler");
    this.isPlaying = !(this.canvas.getAttribute("paused") === "true");
  }

  // Event callback for Spotify SDK script
  onCurrentChange(event: any): void {
    // console.log("track change event handler");
    this.setPlayerData();
  }

  // Event callback for Spotify SDK script
  onPositionChange(event: any): void {
    // console.log("position change event handler");
    // console.log(event);
    // this.setPlayerData();
  }

  // Event callback for next_track Spotify SDK script
  onNextChange(event: any): void {
    // console.log("next change event handler");
    // console.log(event.detail.attributes.next);
    this.next = event.detail.attributes.next;
  }

  onRepeatChange(event: any): void {
    // console.log("repeat change event handler");
    // console.log(event.detail.attributes.repeat);
    this.repeat = parseInt(event.detail.attributes.repeat.nodeValue);
  }

  onShuffleChange(event: any): void {
    // console.log("shuffle change event handler");
    // console.log(event);
    this.shuffle = (event.detail.attributes.shuffle.nodeValue === "true");
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

  // This is called by the EventEmitter in the header component
  changeStation(stationNum: number) {
    console.log("in changeStation");
    if(this.stationNum > 0) {
      // Leave the old station if not playing on 000
      this.radioService.leaveStation(this.stationNum).subscribe();
    }
    this.stationNum = stationNum;

    // Pause the player to begin
    if(this.isPlaying){
      this.playerService.pause().subscribe();
    }

    // BeginAMRadio on station 000, otherwise join/start the station
    if(stationNum === 0){
      this.playRecentTrack();
      return;
    }
    else {
      this.setStation(stationNum);
    }
  }

  // Called by changeStation when the station number is changed
  setStation(stationNum: number): void {
    if(stationNum === 0) {
      return;
    }

    // Get station at given number
    this.radioService.getStation(stationNum).subscribe(data => {
      // This route checks if it exists first, if not it returns back null
      if(data) {
        this.currentStation = data;
        // We should connect to the websocket here
        // this.wsAPI._connect(stationNum);
        this.radioService.joinStation(stationNum).subscribe(() => {
          // now we check if the queue is right
          // if not, we keep skipping until the station is lined up
          
        });
      }
      else {
        this.currentStation = new Station(stationNum);
        if(!this.showPlaylistBar) this.toggleBar(0);
        if(!this.showStationBar) this.toggleBar(1);
      }
    });
  }

  createdStation(): void {
    this.setStation(this.stationNum);
  }

  toggleBar(bar: number): void {
    // Playlist bar = 0, Station bar = 1, Controls panel = 2
    switch(bar) {
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

  changePlaylist(playlist: any) {
    console.log("changePlaylist");
    console.log(playlist);
    this.selectedPlaylist = playlist;
  }

  async checkTokens(): Promise<boolean> {
    await this.spotifyService.checkTokens().subscribe(data => {
      if(data == null) {
        // No access token, so we go away!
        window.location.replace(AppComponent.webURL);
        return false;
      }
      else {
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

  @HostListener('window:unload', [ '$event' ])
  unloadHandler(event: any) {
    console.log("window unload buh bye");
  }

  @HostListener('window:beforeunload', [ '$event' ])
  beforeUnloadHandler(event: any) {
    console.log("window before unload");
    if(this.stationNum > 0) {
      this.radioService.leaveStation(this.stationNum).subscribe();
    }
  }

}

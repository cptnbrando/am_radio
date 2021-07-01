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
  @Output() selectedPlaylistTracks: any = null;

  // This will hold a user playing playlist
  @Output() playingPlaylist: any = null;

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
  @Output() volume: number = 100;

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

  // isLoading
  @Output() isLoading: boolean = true;

  // isTyping
  @Output() isTyping: boolean = false;

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
    // Start isLoading
    this.toggleLoading(true);

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

  // Man... hour 5:48:50 - 5:48:54 on Fireplace 10 hours full hd is nutty
  // This will set the current station to default 000 and get/startAMRadio
  beginAMRadio(): void {
    // So that the station bar doesn't tweak from missing fields
    this.currentStation = new Station();
    this.toggleLoading(true);

    if(this.currentDevice.name != "am_radio") {
      // Get am_radio (This server endpoint find am_radio and sets it as the active device in the Spotify API)
      this.playerService.getAMRadio().subscribe(data => {
        if(data) {
          // If found, set it as the active player
          this.currentDevice = data;

          // Attempt to play a random playlist on am_radio
          this.playerService.startAMRadio().subscribe(data => {
            if(data != null) {
              this.playingPlaylist = data;
              this.changePlaylist(data);
              this.currentStation.stationName = "Recently Played";  
            }

            // stop isLoading
            this.toggleLoading(false);
          });
        }
      });
    } else {
      // If the device is already set, just play a random playlist
      this.playerService.startAMRadio().subscribe(data => {
        this.playingPlaylist = data;
        this.changePlaylist(data);
        this.currentStation.stationName = "Recently Played";

        // stop isLoading
        this.toggleLoading(false);
      });
    }

  }

  /**
   * Plays the last played playlist
   * Sets shuffle to on and skips to next track
   */
  playLastPlayedPlaylist(): void {
    this.spotifyService.getUserPlaylists().subscribe(data => {
      this.playerService.playPlaylist(data[0].uri).subscribe();
    });
  }

  // Event callback for Spotify SDK script
  onPlaybackChange(event: any): void {
    this.isPlaying = !(this.canvas.getAttribute("paused") === "true");
  }

  // Event callback for Spotify SDK script
  onCurrentChange(event: any): void {
    this.setPlayerData();
  }

  // Event callback for Spotify SDK script
  onPositionChange(event: any): void {
    // this.setPlayerData();
  }

  // Event callback for next_track Spotify SDK script
  onNextChange(event: any): void {
    this.next = event.detail.attributes.next;
  }

  // Event callback for repeat changes detected by Spotify SDK player
  onRepeatChange(event: any): void {
    this.repeat = parseInt(event.detail.attributes.repeat.nodeValue);
    this.toggleLoading(false);
  }

  // Event callback for shuffle changes detected by Spotify SDK player
  onShuffleChange(event: any): void {
    this.shuffle = (event.detail.attributes.shuffle.nodeValue === "true");
    this.toggleLoading(false);
  }

  // This will get the current player and set the data to the UI
  setPlayerData(): void {
    this.playerService.getPlayer().subscribe(data => {
      if(data) {
        // Set the data
        this.currentlyPlaying = data.item;
        this.currentDevice = data.device;

        // this.toggleLoading(false);
      }
    });
  }

  // This is called by the EventEmitter in the header component
  changeStation(stationNum: number) {
    this.toggleLoading(true);

    if(this.stationNum > 0) {
      // Leave the old station if not playing on 000
      this.radioService.leaveStation(this.stationNum).subscribe();
    }

    this.stationNum = stationNum;
    this.playingPlaylist = null;

    // Pause the player to begin
    if(this.isPlaying){
      this.playerService.pause().subscribe();
    }

    // BeginAMRadio on station 000, otherwise join/start the station
    if(stationNum === 0){
      this.beginAMRadio();
      return;
    }
    else {
      this.setStation(stationNum);
    }
  }

  // Called by changeStation when the station number is changed if the station exists
  setStation(stationNum: number): void {
    this.toggleLoading(true);

    if(stationNum === 0) {
      return;
    }

    // this.playerService.shuffle(false).subscribe();
    // this.playerService.repeat("off").subscribe();

    this.toggleLoading(true);

    // Get station at given number
    this.radioService.getStation(stationNum).subscribe(data => {
      // This route checks if it exists first, if not it returns back null
      if(data) {
        // Set the volume to 0 to not have that annoying skip
        // Store the previous value to set it afterwards
        let myVol = this.volume;
        this.changeVolume(0);
        this.currentStation = data;

        this.radioService.joinStation(stationNum).subscribe((data) => {
          // now we check if the queue is right
          // if not, we keep skipping until the station is lined up
          if(data) {
            this.toggleLoading(false);
            this.changeVolume(myVol);
          }
        });
      }
      else {
        this.currentStation = new Station(stationNum);
        if(!this.showPlaylistBar) this.toggleBar(0);
        if(!this.showStationBar) this.toggleBar(1);
      }

      this.toggleLoading(false);
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

  // Event callback for playlistBar when a new playlist is selected
  changePlaylist(playlist: any) {
    this.selectedPlaylist = playlist;
    if(playlist === null) {
      this.selectedPlaylistTracks = null;
    } else {
      // Set the station 000 name
      if(this.currentStation && this.stationNum === 0) {
        this.currentStation.stationName = playlist.name;
      }
      // get the tracks from the chosen playlist
      this.spotifyService.getPlaylistTracks(playlist.id).subscribe(data => {
        if(data) {
          this.selectedPlaylistTracks = data;
          this.toggleLoading(false);
        }
      });
    }
  }

  // Play a track on am_radio 000
  playTrack(track: any) {
    this.toggleLoading(true);
    if(this.stationNum != 0) {
      this.changeStation(0);
    }

    this.playerService.playTrack(track.track.uri).subscribe();
  }

  // Play a playlist on am_radio 000
  playPlaylist() {
    this.toggleLoading(true);
    if(this.stationNum != 0) {
      this.changeStation(0);
    }

    this.playerService.playPlaylist(this.selectedPlaylist.uri).subscribe();
    this.playingPlaylist = this.selectedPlaylist;
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

  // Change volume event handler
  changeVolume(value: any): void {
    this.volume = value;
    this.playerService.volume(value).subscribe();
  }

  // Uses the ScriptService to load the Spotify Web Player SDK js script
  loadPlayerScript(): void {
    // We've got an access token, so let's make a spotify web sdk player
    this.script.load('spotifyPlaybackSDK', 'spotifyPlayer').then(data => {
      console.log('scripts loaded ', data);
    }).catch(error => console.log(error));
  }

  // Set the isLoading icon to spin or not
  toggleLoading(start: boolean): void {
    this.isLoading = start;
  }

  // Check for keyboard input typing in chatroom
  toggleTyping(typing: boolean): void {
    console.log(typing);
    this.isTyping = typing;
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

  // If the user is clicking anywhere, they are not typing
  @HostListener('window:click', [ '$event' ])
  clearTyping(event: any) {
    this.toggleTyping(false);
  }

}

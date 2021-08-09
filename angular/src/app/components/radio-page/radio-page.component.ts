import { Component, HostListener, OnInit, Output } from '@angular/core';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { AppComponent } from 'src/app/app.component';
import { RadioService } from 'src/app/services/radio.service';
import { Device } from 'src/app/shared/models/device.model';
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
  @Output() nextURI: string = "";
  @Output() currentURI: string = "";

  // Spotify track information
  @Output() currentlyPlaying: any = {};
  @Output() isPlaying: boolean = false;
  @Output() position: number = 0;
  next: any = "";
  @Output() shuffle: boolean = false;
  @Output() repeat: number = 0;
  @Output() volume: number = 100;

  // The device currently playing
  @Output() currentDevice: any | Device = {};
  @Output() devices: any | Device[] = {};

  // Whether the spotify sdk is ready or not
  // Uses a directive watcher to watch for the canvas state attribute to change to true
  @Output() playerReady: boolean = false;

  // These will toggle the control panes
  @Output() showPlaylistBar: boolean = false;
  @Output() showStationBar: boolean = false;
  @Output() showControls: boolean = false;

  // isLoading
  @Output() isLoading: boolean = true;

  // isMobile
  @Output() isMobile: boolean = false;

  // This is the canvas element
  // We update attributes of it to display changes to the player
  canvas: any;
  showNav: boolean = true;

  @Output() selectedPreset: number = 3;

  @Output() mousePos: Array<number> = [0, 0];

  constructor(private spotifyService: SpotifyService, private playerService: SpotifyPlayerService, private script: ScriptService, private radioService: RadioService) {
    // Start isLoading
    this.toggleLoading(true);
    
    // Immediately check for valid tokens from the server
    // This function will redirect the user back to the homepage if credentials can't be found
    this.checkTokens().then(() => {
      // We've got an access token, so let's make a spotify web sdk player
      this.loadPlayerScript();
      // When we load up, set the User
      this.setUser();
      // Also set the UserPlaylists
      this.setPlaylists();
    }, onrejected => {
      // We don't have an access token, so redirect back to the homepage
      window.location.replace(AppComponent.webURL);
      throw new Error;
    });
  }

  ngOnInit() {
    this.canvas = document.querySelector("canvas");
    if(window.innerWidth <= 960) {
      this.isMobile = true;
      this.showPlaylistBar = false;
      this.showControls = false;
      this.showStationBar = false;
      this.showNav = true;

      document.getElementById("settingsBars")?.addEventListener("click", () => {
        this.toggleNav(4);
      }, true);
    }
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
  getCurrentDevice(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.playerService.getCurrentDevice().subscribe(data => {
        if(data) {
          this.currentDevice = data;
        }
        // console.log(data);
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }

  // This is the event handler for the playerReady sdk js script events
  // It uses dom-watcher to watch the canvas element for attribute changes, updated by the spotifyPlayerSDK.js in /assets
  onPlayerReady(event: any) {
    this.playerReady = event.returnValue;

    // get current device and playback information
    this.setPlayerData().then(data => {
      // Once the radio player is ready, we should prompt the user to swap to the new player
      // ...or we could change it automatically if there's nothing playing rn

      // If nothing is playing, we set am_radio as the active device, then attempt to play the most recently played track
      // Also open the controls panel
      this.playerService.setAMRadio().subscribe(data => {
        // console.log("setAMRadio", data);
        if(data) {
          this.currentDevice = data;
        }
        this.beginAMRadio();
        if(!this.showControls) {
          this.toggleBar(2);
        }
      });
    });
  }

  // Man... hour 5:48:50 - 5:48:54 on Fireplace 10 hours full hd is nutty
  // This will set the current station to default 000 and get/startAMRadio
  beginAMRadio(): void {
    // So that the station bar doesn't tweak from missing fields
    this.currentStation = new Station();
    this.toggleLoading(true);
    // So that it doesn't sound awful loading up
    let currentVol = this.volume;
    this.changeVolume(0);

    // Attempt to play a random playlist on am_radio
    this.playerService.startAMRadio().subscribe(data => {
      if(data) {
        this.playingPlaylist = data;
        this.currentStation.stationName = data.name;
        this.changePlaylist(data);
      }
      
      // Change volume back, and toggle loading
      this.changeVolume(currentVol);
      this.toggleLoading(false);
    });
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

  /**
   * Gets the station at the given number and queues up the nextURI track if it hasn't been queued already
   * @param stationNum the number to get
   */
  queueNextTrack(stationNum: number): void {
    // Wait a few seconds so that the station gets updated first
    setTimeout(() => {
      this.radioService.getStation(stationNum).subscribe(data => {
        if(data) {
          this.currentStation = data;
          this.currentURI = data.currentURI;
          if(data.nextURI != this.nextURI) {
            this.nextURI = data.nextURI;
            this.playerService.addToQueue(this.nextURI).subscribe();
            this.setPlayerData();
            // console.log("Added to queue", data.nextURI);
          }
        }
      });
    }, 5000);
  }

  // Event callback for Spotify SDK script
  onPlaybackChange(event: any): void {
    this.isPlaying = !(this.canvas.getAttribute("paused") === "true");
  }

  // Event callback for Spotify SDK script
  onCurrentChange(event: any): void {
    // This is the queue loop for an infinite station
    let currentCanvas = this.canvas.getAttribute("current");
    (<any>window).spotifyPlayer.getCurrentState().then((data: any) => {
      if(data) {
        if(data.track_window.current_track.uri != this.currentURI && !this.isLoading) {
          // Update the player data if the current song was changed
          this.currentURI = currentCanvas;

          this.setPlayerData();

          // This is going to be our queue loop to add new songs to the queue
          if(this.stationNum > 0 && this.currentStation.playTime > 0) {
            this.queueNextTrack(this.stationNum);
          }
        }
      }
    });
  }

  // Event callback for repeat changes detected by Spotify SDK player
  onRepeatChange(event: any): void {
    this.repeat = parseInt(this.canvas.getAttribute("repeat"));
  }

  // Event callback for shuffle changes detected by Spotify SDK player
  onShuffleChange(event: any): void {
    this.shuffle = (this.canvas.getAttribute("shuffle") === "true");
  }

  // This will get the current player and set the data to the UI
  setPlayerData(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.playerService.getPlayer().subscribe(data => {
        if(data) {
          // Set the data
          this.position = data.progress_ms;
          this.currentlyPlaying = data.item;
          this.currentURI = data.item.uri;
          this.currentDevice = data.device;
          this.isPlaying = data.is_playing;
        }
        resolve(data);
      }, error => {
        reject(error);
      });
    })
  }

  /**
   * Get the current station and set currentStation and currentURI
   */
  setStationData(): void {
    if(this.stationNum > 0) {
      this.radioService.getStation(this.stationNum).subscribe(data => {
        if(data) {
          this.currentStation = data;
          this.currentURI = data.currentURI;
        }
      })
    }
  }

  // This is called by the EventEmitter in the header component
  changeStation(stationNum: number) {
    this.toggleLoading(true);

    if(this.stationNum > 0 && this.currentStation.playTime != 0) {
      // Leave the old station if not playing on 000
      this.radioService.leaveStation(this.stationNum).subscribe();
    }

    this.stationNum = stationNum;
    this.playingPlaylist = null;

    // Pause the player to begin
    if(this.isPlaying){
      this.playerService.pause().subscribe();
    }
    
    if(stationNum === 0){
      this.beginAMRadio();
    }
    else {
      this.setStation(stationNum);
      // BeginAMRadio on station 000, otherwise join/start the station
      if(!this.showNav) {
        this.toggleLoading(false);
        this.toggleNav(4);
      }
    }
  }

  // Called by changeStation when the station number is changed if the station exists
  setStation(stationNum: number): void {
    this.toggleLoading(true);

    // This shouldn't get here if we're at 000...
    if(stationNum === 0) {
      this.toggleLoading(false);
      return;
    }

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
            this.currentURI = data.currentURI;
            this.nextURI = data.nextURI;
            this.currentStation = data;
            this.setPlayerData();
          }
        });
      }
      else {
        this.currentStation = new Station(stationNum);
        if(!this.showPlaylistBar) this.toggleBar(0);
        if(!this.showStationBar) this.toggleBar(1);
        this.toggleLoading(false);
        this.setPlayerData();
      }
    });
  }

  // Event callback for station bar createStation()
  onCreatedStation(data: any): void {
    this.setStation(this.stationNum);
  }

  toggleBar(bar: number): void {
    // Playlist bar = 0, Station bar = 1, Controls panel = 2
    // OnMobile we clear them all first
    let station = this.showStationBar;
    let playlist = this.showPlaylistBar;
    let controls = this.showControls;
    if(this.isMobile) {
      this.showPlaylistBar = false;
      this.showControls = false;
      this.showStationBar = false;
    }
    switch(bar) {
      case 0:
        this.showPlaylistBar = (playlist) ? false : true;
        break;
      case 1:
        this.showStationBar = (station) ? false : true;
        break;
      case 2:
        this.showControls = (controls) ? false : true;
        break;
    }
  }

  // Event callback for playlistBar when a new playlist is selected
  changePlaylist(playlist: any) {
    this.selectedPlaylist = playlist;
    if(playlist === null) {
      this.selectedPlaylistTracks = null;
      return;
    } 
    // get the tracks from the chosen playlist
    this.spotifyService.getPlaylistTracks(playlist.id).subscribe(data => {
      if(data) {
        this.selectedPlaylistTracks = data;
        this.toggleLoading(false);
      }
    });
  }

  // Play a track on am_radio 000
  // track is actually an array: [track, element]
  playTrack(track: any) {
    this.toggleLoading(true);
    if(this.stationNum != 0) {
      this.changeStation(0);
    }

    this.playerService.playTrack(track[0].track.uri).subscribe(data => {
      this.toggleLoading(false);
      track[1].style.borderColor = "white";
    });
  }

  // EventListener for playPlaylistEvent
  playPlaylist() {
    this.toggleLoading(true);
    if(this.stationNum != 0) {
      this.changeStation(0);
    }

    this.playerService.playPlaylist(this.selectedPlaylist.uri).subscribe(data => {
      this.playingPlaylist = this.selectedPlaylist;
      this.currentStation.stationName = this.selectedPlaylist.name;
      this.toggleLoading(false);
    });
  }

  checkTokens(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.spotifyService.checkTokens().subscribe(data => {
        if(data === null) {
          reject(false);
        }
        else {
          // We have to set it to local storage so the playback sdk js script can get it
          localStorage.setItem("accessToken", data.message);
          resolve(true);
        }
      }, error => {
        reject(false);
      });
    });
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

  /**
   * Toggle fullscreen for visualizer
   * @param bar 0 for playlistBar, 1 for controlsBar, 2 for stationBar, 3 for header/player
   * @returns nothing lol
   */
  toggleNav(bar: number): void {
    if(this.isLoading) return;
    if(this.showNav) {
      switch(bar) {
        case 0:
          if(this.showPlaylistBar) return;
          break;
        case 1:
          if(this.showControls) return;
          break;
        case 2:
          if(this.showStationBar) return;
          break;
        case 3:
          return;
        case 4:
          if(this.showPlaylistBar) return;
          if(this.showControls) return;
          if(this.showStationBar) return;
          break;
      }
    }

    const overlay = Array.from(document.getElementsByClassName("disappear") as HTMLCollectionOf<HTMLElement>);
    if(this.showNav) {
      overlay.forEach(element => {
        element.style.visibility = "hidden"
      });
    } else {
      overlay.forEach(element => {
        element.style.visibility = "visible"
      });
    }
    this.showNav = !this.showNav;
  }

  @HostListener('window:unload', ['$event'])
  unloadHandler(event: any) {
    console.log("window unload buh bye");
    if(this.stationNum > 0) {
      this.radioService.leaveStation(this.stationNum).subscribe();
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: any) {
    console.log("window before unload");
    if(this.stationNum > 0) {
      this.radioService.leaveStation(this.stationNum).subscribe();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if(event.target.innerWidth <= 960) {
      this.isMobile = true;

      document.getElementById("settingsBars")?.addEventListener("click", () => {
        this.toggleNav(4);
      }, true);
    }
    else {
      document.getElementById("settingsBars")?.removeEventListener("click", () => {
        this.toggleNav(4);
      }, true);
      this.isMobile = false;
    }

    this.showPlaylistBar = false;
    this.showControls = false;
    this.showStationBar = false;
    this.showNav = true;
  }

  @HostListener('mousemove', ['$event'])
  onMousemove(event: MouseEvent) {
    this.mousePos = [event.clientX, event.clientY];
  }
}

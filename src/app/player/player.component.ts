/// <reference types="@types/spotify-web-playback-sdk"/>

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  faPlay = faPlay;
  faPause = faPause;

  @Input() showPlaylistBar: boolean;
  @Input() showStationBar: boolean;
  @Input() isPlaying: boolean;
  @Input() accessToken: string;

  @Output() toggleBarEvent = new EventEmitter<number>();
  @Output() isPlayingEvent = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
    this.spotifyWebSDKInit();
  }

  toggleBar(bar: number) {
    this.toggleBarEvent.emit(bar);
  }

  togglePlay() {
    this.isPlayingEvent.emit(true);
  }

  spotifyWebSDKInit(): void {
    // Initializing the web sdk player
    // https://www.npmjs.com/package/@types/spotify-web-playback-sdk
    // https://developer.spotify.com/documentation/web-playback-sdk/quick-start/
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new Spotify.Player({
        name: 'am_radio',
        getOAuthToken: cb => { cb(this.accessToken); }
      });

      // Error handling
      player.addListener('initialization_error', ({ message }) => { console.error(message); });
      player.addListener('authentication_error', ({ message }) => { console.error(message); });
      player.addListener('account_error', ({ message }) => { console.error(message); });
      player.addListener('playback_error', ({ message }) => { console.error(message); });

      // Playback status updates
      player.addListener('player_state_changed', state => { console.log(state); });

      // Ready
      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
      });

      // Not Ready
      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      // Connect to the player!
      player.connect();
    }
  }

}

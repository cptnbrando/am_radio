import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { SpotifyPlayerService } from '../spotify-player.service';
import { SpotifyService } from '../spotify.service';

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

  currentDevice: any;
  currentDeviceName: string = "No Current Device!";

  currentlyPlaying: any;
  currentlyPlayingSong: string = "Nothing";
  currentlyPlayingArtist: string = "No Artist";
  currentlyPlayingImage: string = "";

  @Output() toggleBarEvent = new EventEmitter<number>();
  @Output() isPlayingEvent = new EventEmitter<boolean>();

  constructor(private spotifyService: SpotifyService, private spotifyPlayer: SpotifyPlayerService) { }

  ngOnInit(): void {
    // Next see if anything is playing and a device is active
    this.spotifyPlayer.getCurrentlyPlaying().subscribe(data => {
      if(data)
      {
        this.currentlyPlaying = data;
        this.currentlyPlayingSong = data.item.name
        this.currentlyPlayingArtist = data.item.artists[0].name;
        this.currentlyPlayingImage = data.item.album.images[0].url;

        console.log(this.currentlyPlaying);

        this.spotifyService.getCurrentDevice().subscribe(data => {
          if(data)
          {
            // If there's an active device, set the device and name, then toggle isPlaying to true
            this.currentDevice = data;
            this.currentDeviceName = data.name;
            this.isPlayingEvent.emit(true);
            console.log(this.currentDevice);
          }
        })
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
      this.spotifyPlayer.pause().subscribe(data => {
        this.isPlayingEvent.emit(data);
      })
    }
    else
    {
      // The player is not playing, so we want to play it!
      this.spotifyPlayer.play().subscribe(data => {
        this.isPlayingEvent.emit(data);
      })
    }
  }
}

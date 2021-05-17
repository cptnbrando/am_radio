import { Component, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { AuthService } from '../auth.service';
import { SpotifyService } from '../spotify.service';

@Component({
  selector: 'app-radio-page',
  templateUrl: './radio-page.component.html',
  styleUrls: ['./radio-page.component.scss']
})
export class RadioPageComponent implements OnInit {

  faSpotify = faSpotify;

  // This will hold a spotify uri for the logged in user
  @Input() spotifyUser: string = null;

  // This will hold an array of playlist uris for the user
  @Input() userPlaylists: string = null;

  // What station the user is on, begins on 0
  @Output() stationNum: number = 0;

  // Whether the user is playing a song or not
  @Output() isPlaying: boolean = false;

  // These will toggle the control panes
  @Output() showPlaylistBar: boolean = false;
  @Output() showStationBar: boolean = false;
  @Output() showControls: boolean = false;

  authToken: string = "";

  constructor(private spotifyService: SpotifyService, private route: ActivatedRoute, private authService: AuthService) {}

  ngOnInit() {
    // this.authService.accessToken = "";
    // this.authService.refreshToken = "";
    this.authToken = this.authService.accessToken;
    console.log(this.authService.refreshToken);
  }

  login(): void {
    this.spotifyService.getCodeURL().subscribe(data => {
      if(data)
      {
        // This should use the interceptor and a pipe to set the tokens to the auth service!!!
        window.location.replace(data.message);
      }
    })
  }

  toggleBar(bar: number)
  {
    // Playlist bar = 0, Station bar = 1
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

}

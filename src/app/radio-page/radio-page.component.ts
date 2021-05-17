import { Component, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { SpotifyService } from '../spotify.service';

@Component({
  selector: 'app-radio-page',
  templateUrl: './radio-page.component.html',
  styleUrls: ['./radio-page.component.scss']
})
export class RadioPageComponent implements OnInit {

  faSpotify = faSpotify;

  // This will hold a spotify uri for the logged in user
  @Input() user: object;

  // This will hold an array of playlist uris for the user
  @Output() userPlaylists: object[];

  // What station the user is on, begins on 0
  @Output() stationNum: number = 0;

  // Whether the user is playing a song or not
  @Output() isPlaying: boolean = false;

  // These will toggle the control panes
  @Output() showPlaylistBar: boolean = false;
  @Output() showStationBar: boolean = false;
  @Output() showControls: boolean = false;

  authToken: string = "";

  constructor(private spotifyService: SpotifyService) {}

  ngOnInit() {
    // Check for access token
    this.spotifyService.getAccessToken().subscribe(data => {
      if(data.message == "NO TOKEN FOUND")
      {
        window.location.replace(this.spotifyService.webURL);
      }
      else
      {
        // When we load up, get the user and the user's playlists
        this.spotifyService.getUser().subscribe(data => {
          this.user = data;
          console.log(this.user);
        })

        this.spotifyService.getUserPlaylists().subscribe(data => {
          this.userPlaylists = data;
          console.log(this.userPlaylists);
        });
      }
    });
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

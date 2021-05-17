import { Component, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { SpotifyService } from './spotify.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'am_radio';
  faSpotify = faSpotify;

  constructor(private spotifyService: SpotifyService) {}

  ngOnInit() {
    // We should check for valid session tokens here
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
}

import { Component, OnInit } from '@angular/core';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { SpotifyService } from '../spotify.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  faSpotify = faSpotify;

  constructor(private spotifyService: SpotifyService) { }

  ngOnInit(): void {
    // Check if there's a token, if so go to application
    this.spotifyService.getAccessToken().subscribe(data => {
      console.log(data);
      if(data.message != "NO TOKEN FOUND" && data.message.length > 25)
      {
        window.location.replace(this.spotifyService.webURL + "/app");
      }
    })
  }

  login(): void {
    this.spotifyService.getCodeURL().subscribe(data => {
      if(data)
      {
        window.location.replace(data.message);
      }
    })
  }

}

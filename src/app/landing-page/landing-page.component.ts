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
    // Check if there's an access token, if so set it to local storage and go to the app
    this.spotifyService.checkTokens().subscribe(data => 
    {
      if(data != null)
      {
        localStorage.clear();
        localStorage.setItem("accessToken", data.message);
        window.location.replace(this.spotifyService.webURL + "/app");
      }
      else
      {
        console.log("Server reached: no valid tokens found");
      }
    }, error => {
      console.log("Error getting to server");
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

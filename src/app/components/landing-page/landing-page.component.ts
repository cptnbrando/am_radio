import { Component, OnInit } from '@angular/core';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { SpotifyService } from '../../services/spotify.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  faSpotify = faSpotify;

  constructor(private spotifyService: SpotifyService) { }

  ngOnInit(): void {
    // Check if there's an access token in local storage
    if(!localStorage.getItem("accessToken"))
    {
      // null value means no sign in
      return;
    }

    // If so, check the server for valid tokens
    this.spotifyService.checkTokens().subscribe(data => 
    {
      if(data)
      {
        // Valid tokens found, set them to local storage and go to the app
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
    // Get a login URI from the server
    this.spotifyService.getCodeURL().subscribe(data => {
      if(data)
      {
        window.location.replace(data.message);
      }
    })
  }

}

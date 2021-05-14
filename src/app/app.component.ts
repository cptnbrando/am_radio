import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { AuthService } from './auth.service';
import { SpotifyService } from './spotify.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'am_radio';
  faSpotify = faSpotify;

  @Input() spotifyUser: any = null;
  @Input() userPlaylists: any = null;
  authToken: string = "";

  constructor(private spotifyService: SpotifyService, private route: ActivatedRoute, private authService: AuthService) {}

  // This uses the AuthService to get / set the access token, which uses localStorage for now...
  // This should be changed so it is never stored, only used with the token interceptor
  ngOnInit() {
    if(!this.authService.token)
    {
      this.route.queryParams.subscribe(params => {
        if(params.token != null)
        {
          this.authService.token = params.token;
          window.location.replace("http://localhost:4200");
        }
      });
    }
    else
    {
      this.authToken = this.authService.token;
    }
  }

  login(): void {
    this.spotifyService.loginUser().subscribe(data => {
      if(data)
      {
        window.location.replace(data.message);
      }
    })
  }
}

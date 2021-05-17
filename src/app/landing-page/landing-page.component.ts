import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { AuthService } from '../auth.service';
import { SpotifyService } from '../spotify.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  faSpotify = faSpotify;

  constructor(private spotifyService: SpotifyService, private route: ActivatedRoute, private authService: AuthService) { }

  ngOnInit(): void {
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

import { trigger, transition, style, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { faGithub, faInstagram, faSpotify, faTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faAngleDoubleLeft, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';
import { AppComponent } from 'src/app/app.component';
import { SpotifyService } from '../../services/spotify.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  animations: [
    trigger('fadeSlideOutIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100px)' }),
        animate('150ms', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
      transition(':leave', [
        animate('150ms', style({ opacity: 0, transform: 'translateX(100px)' })),
      ]),
    ]),
    trigger('fadeSlideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-100px)' }),
        animate('150ms', style({ opacity: 1, transform: 'translateX(10px)' })),
      ]),
      transition(':leave', [
        animate('150ms', style({ opacity: 0, transform: 'translateX(-100px)' })),
      ]),
    ]),
  ]
})
export class LandingPageComponent implements OnInit {
  // Media icons
  faSpotify = faSpotify;
  faGithub = faGithub;
  faTwitter = faTwitter;
  faInstagram = faInstagram;
  faYoutube = faYoutube;

  // Controls icons
  faAngleDoubleRight = faAngleDoubleRight;
  faAngleDoubleLeft = faAngleDoubleLeft;

  // Tracks the current page, 0=login, 1=about
  currentPage: number = 0;

  constructor(private spotifyService: SpotifyService) { }

  ngOnInit(): void {
    // Check if there's an access token in local storage
    if(!localStorage.getItem("accessToken")) {
      // null value means no sign in
      return;
    }

    // If so, check the server for valid tokens
    this.spotifyService.checkTokens().subscribe(data => {
      if(data) {
        // Valid tokens found, set them to local storage and go to the app
        localStorage.clear();
        localStorage.setItem("accessToken", data.message);
        window.location.replace(AppComponent.webURL + "/app");
      }
      else {
        console.log("Server reached: no valid tokens found");
      }
    }, error => {
      console.error("Error getting to server", error);
    })
  }

  login(): void {
    // Get a login URI from the server
    this.spotifyService.getCodeURL().subscribe(data => {
      if(data) {
        window.location.replace(data.message);
      }
    }, error => {
      console.error("Error logging in", error);
    })
  }

  loginPage(): void {
    this.currentPage = 0;
  }

  aboutPage(): void {
    this.currentPage = 1;
  }

}

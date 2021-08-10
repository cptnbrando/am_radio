import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './app-settings.component.html',
  styleUrls: ['./app-settings.component.scss']
})
export class AppSettingsComponent implements OnInit {
  isFullscreen: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
    this.isFullscreen = document.fullscreenElement != null;
  }

  toggleFullscreen() {
    if(this.isFullscreen) {
      document.exitFullscreen();
    }
    else {
      document.querySelector("body")?.requestFullscreen();
    }
  }
}

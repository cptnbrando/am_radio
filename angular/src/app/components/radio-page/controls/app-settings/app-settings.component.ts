import { AfterViewInit, Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './app-settings.component.html',
  styleUrls: ['./app-settings.component.scss']
})
export class AppSettingsComponent implements OnInit, AfterViewInit {
  isFullscreen: boolean = false;


  constructor() {
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
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

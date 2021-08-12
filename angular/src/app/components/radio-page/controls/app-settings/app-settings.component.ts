import { Component, Input, OnInit } from '@angular/core';
import { faVolumeUp } from '@fortawesome/free-solid-svg-icons';
import { SpotifyPlayerService } from 'src/app/services/spotify-player.service';
import { Device } from 'src/app/shared/models/device.model';

@Component({
  selector: 'app-settings',
  templateUrl: './app-settings.component.html',
  styleUrls: ['./app-settings.component.scss']
})
export class AppSettingsComponent implements OnInit {
  isFullscreen: boolean = false;
  devices: Device[] = [];

  @Input() isLoading: boolean = false;

  faVolumeUp = faVolumeUp;

  constructor(private playerService: SpotifyPlayerService) {
  }

  ngOnInit(): void {
    this.isFullscreen = document.fullscreenElement != null;
    this.refreshDevices();
  }

  toggleFullscreen() {
    if(this.isFullscreen) {
      document.exitFullscreen();
      window.scrollTo(0, 0);
    }
    else {
      document.querySelector("body")?.requestFullscreen();
    }
  }

  refreshDevices(): void {
    this.playerService.getDevices().subscribe(data => {
      this.devices = data;
    });
  }

  changeDevice(id: string): void {
    if(!this.isLoading) {
      this.playerService.playOn(id).subscribe(data => {
        this.refreshDevices();
      });
    }
  }
}

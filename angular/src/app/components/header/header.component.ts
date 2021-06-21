import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() showControls: boolean;
  @Input() stationNum: number;

  @Output() toggleBarEvent = new EventEmitter<number>();
  @Output() changeStationEvent = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void {
  }

  // Toggles the sidebars, 0 for playlistBar, 1 for stationBar
  toggleBar(bar: number) {
    this.toggleBarEvent.emit(bar);
  }

  // Sends an event to the app with a new station number
  changeStation(num: number) {
    if(num < 0 || num > 100)
    {
      return;
    }
    this.changeStationEvent.emit(num);
  }

  // Used to format the displayed number into a 000 leading zero varient
  stationNumDisplay(): string {
    if(this.stationNum < 10)
    {
      return `00${this.stationNum}`;
    }
    else if(this.stationNum < 100)
    {
      return `0${this.stationNum}`;
    }
    else
    {
      return `${this.stationNum}`;
    }
  }

}

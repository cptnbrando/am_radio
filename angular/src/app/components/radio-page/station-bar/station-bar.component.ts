import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { RadioService } from 'src/app/services/radio.service';
import { Station } from 'src/app/shared/models/station.model';

@Component({
  selector: 'app-station-bar',
  templateUrl: './station-bar.component.html',
  styleUrls: ['./station-bar.component.scss']
})
export class StationBarComponent implements OnInit {

  @Input() showStationBar: boolean = false;
  @Input() currentStation: Station;
  @Input() selectedPlaylist: any;

  @Output() createdStation = new EventEmitter<any>();

  // Loading icon
  @Input() isLoading: boolean = true;
  @Output() toggleLoadingEvent = new EventEmitter<boolean>();

  @Input() stationNum: number = 0;

  constructor(private radioService: RadioService) {
    this.currentStation = new Station;
  }

  ngOnInit(): void {
    
  }

  // Used to format the displayed number into a 000 leading zero varient
  stationNumDisplay(): string {
    if(this.stationNum < 10) {
      return `00${this.stationNum}`;
    }
    else if(this.stationNum < 100) {
      return `0${this.stationNum}`;
    }
    else {
      return `${this.stationNum}`;
    }
  }
  
  createRadio() {
    if(!this.isLoading) {
      this.toggleLoadingEvent.emit(true);
      if(this.selectedPlaylist) {
        this.radioService.createStation(this.stationNum, this.selectedPlaylist).subscribe(data => {
          if(data.message === "Created"){
            // console.log(data);
            this.createdStation.emit(data);
          }
        });
      }
    }
  }
}

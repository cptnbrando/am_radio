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
  @Input() stationNum: number = 0;
  @Input() selectedPlaylist: any;

  @Output() createdStation = new EventEmitter<any>();

  // Loading icon
  @Input() isLoading: boolean = true;
  @Output() toggleLoadingEvent = new EventEmitter<boolean>();

  constructor(private radioService: RadioService) {
    this.currentStation = new Station;
  }

  ngOnInit(): void {
    
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

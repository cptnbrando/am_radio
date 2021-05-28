import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { RadioService } from 'src/app/services/radio.service';
import { Station } from 'src/app/shared/models/station.model';

@Component({
  selector: 'app-station-bar',
  templateUrl: './station-bar.component.html',
  styleUrls: ['./station-bar.component.scss']
})
export class StationBarComponent implements OnInit {

  @Input() showStationBar: boolean;
  @Input() currentStation: Station;
  @Input() stationNum: number;
  @Input() selectedPlaylist: any;

  @Output() createdStation = new EventEmitter<any>();

  constructor(private radioService: RadioService) { }

  ngOnInit(): void {

  }

  createRadio() {
    this.radioService.createStation(this.stationNum, this.selectedPlaylist).subscribe(data => {
      if(data.message === "Created"){
        console.log(data);
        this.createdStation.emit();
      }
    });
  }

}

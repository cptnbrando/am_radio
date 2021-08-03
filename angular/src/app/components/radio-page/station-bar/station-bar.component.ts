import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { RadioService } from 'src/app/services/radio.service';
import { Station } from 'src/app/shared/models/station.model';

@Component({
  selector: 'app-station-bar',
  templateUrl: './station-bar.component.html',
  styleUrls: ['./station-bar.component.scss']
})
export class StationBarComponent implements OnInit, OnChanges {

  @Input() showStationBar: boolean = false;
  @Input() currentStation: Station;
  @Input() selectedPlaylist: any;

  @Output() createdStation = new EventEmitter<any>();

  // Loading icon
  @Input() isLoading: boolean = true;
  @Output() toggleLoadingEvent = new EventEmitter<boolean>();

  @Input() stationNum: number = 0;

  // For displaying right
  _stationNumDisplay: string = "";
  _stationDateDisplay: string = "";

  // Error message for bad creation of station
  errorMessage: string = "";

  constructor(private radioService: RadioService) {
    this.currentStation = new Station;
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: any): void {
    if(this.stationNum != 0) {
      if(changes.stationNum) {
        this.errorMessage = "";
        this._stationNumDisplay = this.stationNumDisplay(this.stationNum);
      }
      if(changes.currentStation) {
        this._stationDateDisplay = (this.currentStation) ? this.stationDateDisplay(this.currentStation.stationCreated) : "";
      }
    }
  }

  // Used to format the displayed number into a 000 leading zero varient
  stationNumDisplay(num: number): string {
    if(num < 10) {
      return `00${num}`;
    }
    else if(num < 100) {
      return `0${num}`;
    }
    else {
      return `${num}`;
    }
  }

  stationDateDisplay(dateString: any): string {
    let date = new Date(dateString);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let month = months[date.getMonth()];

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let day = days[date.getDay()];
    let dayNum = date.getDate();
    let dayNumSuffix = "";
    switch(dayNum % 10) {
      case 1:
        dayNumSuffix = "st";
        break;
      case 2:
        dayNumSuffix = "nd";
        break;
      case 3:
        dayNumSuffix = "rd";
        break;
      default:
        dayNumSuffix = "th";
    }

    let hours = date.getHours();
    let dom = (hours < 12) ? "am" : "pm";
    let time = `${Math.floor(hours / 2)}:${date.getMinutes()}:${date.getSeconds()}${dom}`;
    
    return `${day}, ${month} ${dayNum}${dayNumSuffix} at ${time}`;
  }
  
  // Create a new radio station on an unowned station
  createRadio(): void {
    if(!this.isLoading) {
      this.toggleLoadingEvent.emit(true);
      // Check again if the station is taken
      this.radioService.getStation(this.stationNum).subscribe(data => {
        if(data === null) {
          // Use the service to create a new Station
          this.radioService.createStation(this.stationNum, this.selectedPlaylist).subscribe(data => {
            console.log("createRadio()", data);
            if(data.message === "Created"){
              this.createdStation.emit(data);
              this.errorMessage = "";
            } else {
              this.toggleLoadingEvent.emit(false);
              this.errorMessage = data.message;
            }
          });
        }
        else {
          this.createdStation.emit(data);
        }
      })
    }
  }
}

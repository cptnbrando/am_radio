import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { faRedo } from '@fortawesome/free-solid-svg-icons';
import { RadioService } from 'src/app/services/radio.service';
import { Station } from 'src/app/shared/models/station.model';

class TableStation {
  // ID of the Station, aka the Station number or channel
  stationID: number;

  // Date of Station creation
  stationCreated: any;

  // Name of the Station, should be set to the Spotify Playlist initially
  stationName: string;

  constructor(id: number, date: any, name: string) {
    this.stationID = id;
    this.stationCreated = date;
    this.stationName = name;
  }
}

@Component({
  selector: 'stations-panel',
  templateUrl: './stations.component.html',
  styleUrls: ['./stations.component.scss']
})
export class StationsComponent implements OnInit, OnChanges {
  @Input() stationNum: number = 0;
  allStations: Station[] = [];
  @Input() isMobile: boolean = false;

  @Output() changeStationEvent = new EventEmitter<number>();

  mobileCols = [
    {
      columnDef: 'id',
      header: 'No.',
      cell: (element: Station) => `${this.stationNumDisplay(element.stationID)}`,
    },
    {
      columnDef: 'name',
      header: 'Name',
      cell: (element: Station) => `${element.stationName}`,
    },
    {
      columnDef: 'current',
      header: 'Now Playing',
      cell: (element: Station) => (element.current) ? `${element.current.artists[0].name} - ${element.current.name}` : "Inactive",
    }
  ];

  columns = [
    {
      columnDef: 'id',
      header: 'No.',
      cell: (element: Station) => `${this.stationNumDisplay(element.stationID)}`,
    },
    {
      columnDef: 'name',
      header: 'Name',
      cell: (element: Station) => `${element.stationName}`,
    },
    {
      columnDef: 'current',
      header: 'Now Playing',
      cell: (element: Station) => (element.current) ? `${element.current.artists[0].name} - ${element.current.name}` : "Inactive",
    },
    {
      columnDef: 'date',
      header: 'Created On',
      cell: (element: Station) => `${this.stationDateDisplay(element.stationCreated)}`,
    }
  ];

  faRedo = faRedo;

  displayedColumns = this.columns.map(c => c.columnDef);

  constructor(private radioService: RadioService) { }
  ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes);
    if(changes.stationNum) {
      if(changes.stationNum.currentValue > 0) {
        this.refreshStations();
      }
    }
    if(changes.isMobile) {
      if(changes.isMobile.currentValue === true) {
        this.columns = this.mobileCols;
        this.displayedColumns = this.mobileCols.map(c => c.columnDef);
      }
    }
  }

  ngOnInit(): void {
    this.refreshStations();
  }

  refreshStations(): void {
    this.radioService.getAllStations().subscribe(data => {
      // console.log(data);
      this.allStations = data;
    });
  }

  changeStation(formatNum: any): void {
    console.log(formatNum);
  }

  /**
   * Prints a JSON date as a legible date
   * @param dateString JSON date
   * @returns formatted date: {month} {dayNum}{suffix} at {hour}:{minute with leading 0}{am/pm}
   */
  stationDateDisplay(dateString: any): string {
    let date = new Date(dateString);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let month = months[date.getMonth()];

    let dayNum = date.getDate();
    let dayNumSuffix = "";
    if(dayNum < 10 || dayNum > 20) {
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
    }
    else {
      dayNumSuffix = "th";
    }

    let hours = (date.getHours() < 10) ? `0${Math.floor(date.getHours() / 2)}` : `${Math.floor(date.getHours() / 2)}`;
    let dom = (date.getHours() < 12) ? "am" : "pm";
    const minutes = (date.getMinutes() < 10) ? `0${date.getMinutes()}` : `${date.getMinutes()}`
    let time = `${hours}:${minutes}${dom}`;
    
    return `${month} ${dayNum}${dayNumSuffix} at ${time}`;
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

}

import { trigger, state, style, transition, animate } from '@angular/animations';
import { DataSource } from '@angular/cdk/collections';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, of, scheduled } from 'rxjs';
import { Station } from 'src/app/shared/models/station.model';

@Component({
  selector: 'mobile-stations',
  templateUrl: './mobile-stations.component.html',
  styleUrls: ['./mobile-stations.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('void', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('*', style({ height: '*', visibility: 'visible' })),
      transition('void <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class MobileStationsComponent implements OnInit, OnChanges {
  displayedColumns: string[] = ['id', 'name'];
  @Input() allStations: Station[] = [];
  dataSource = new MatTableDataSource<Station>(this.allStations);
  
  isExpansionDetailRow = (i: number, row: Station) => row.hasOwnProperty('detailRow');
  expandedElement: any;
  @Output() changeStationEvent = new EventEmitter<Station>();


  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.allStations) {
      if(changes.allStations.currentValue !== changes.allStations.previousValue) {
        this.dataSource = new MatTableDataSource<Station>(this.allStations);
      }
    }
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<Station>(this.allStations);
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

  changeStation(station: Station): void {
    this.changeStationEvent.emit(station);
  }

}

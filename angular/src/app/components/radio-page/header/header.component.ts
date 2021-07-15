import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() showControls: boolean = false;
  @Input() stationNum: number = 0;

  @Output() toggleBarEvent = new EventEmitter<number>();
  @Output() changeStationEvent = new EventEmitter<number>();

  // Loading icon
  @Input() isLoading: boolean = true;
  @Output() toggleLoadingEvent = new EventEmitter<boolean>();

  // Timers for fluid station changing
  stationTimer: any = 0;

  // Number key for key press
  _numberKey: number = -1;

  constructor() { }

  ngOnInit(): void {
  }

  // Changes when a number key is pressed from Player
  changeNumberKey(value: number) {
    if(this._numberKey === -1) {
      this._numberKey = value;
    } else {
      let current = String(this._numberKey);
      if(current.length < 3) {
        current += String(value);
        this._numberKey = parseInt(current);
      } else {
        return;
      }
    }

    if(this._numberKey < 1000 && this._numberKey > -1) {
      this.stationNum = this._numberKey;
    }

    // Timer so we can quickly move through stations without actually changing the station
    clearTimeout(this.stationTimer);
    this.stationTimer = setTimeout(() => {
      this.actuallyChangeStation(this._numberKey);
    }, 1500);
  }

  get numberKey(): number {
    return this._numberKey;
  }

  // Toggles the sidebars, 0 for playlistBar, 1 for stationBar
  toggleBar(bar: number) {
    this.toggleBarEvent.emit(bar);
  }

  // Sends an event to the app with a new station number
  changeStation(num: number) {
    if(!this.isLoading) {
      if(num < 0 || num > 999){
        return;
      }

      this.stationNum = num;

      // Timer so we can quickly move through stations without actually changing the station
      clearTimeout(this.stationTimer);
      this.stationTimer = setTimeout(() => {
        this.actuallyChangeStation(num);
      }, 1500);
    }
  }

  actuallyChangeStation(num: number) {
    this.toggleLoadingEvent.emit(true);
    this.changeStationEvent.emit(num);
    this._numberKey = -1;
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

  // Logout from am_radio
  logout(): any {
    localStorage.clear();
    window.location.replace(AppComponent.webURL);
  }

  // Listens for keyboard events to control the player
  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if(!(this.showControls) && !this.isLoading) {
      switch(event.code) {
        // Recognize number input to change station
        case "Digit1":
        case "Digit2":
        case "Digit3":
        case "Digit4":
        case "Digit5":
        case "Digit6":
        case "Digit7":
        case "Digit8":
        case "Digit9":
        case "Digit0":
          this.changeNumberKey(parseInt(event.code.substring(5)));
          break;
        case "ArrowUp":
          let num = this.stationNum + 1;
          this.changeStation(num);
          break;
        case "ArrowDown":
          let num2 = this.stationNum - 1;
          this.changeStation(num2);
          break;
      }
    }
  }
}

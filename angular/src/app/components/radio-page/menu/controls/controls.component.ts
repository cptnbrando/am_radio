import { trigger, transition, style, animate } from '@angular/animations';
import { AfterViewChecked, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { RadioService } from 'src/app/services/radio.service';
import { SocketService } from 'src/app/services/socket.service';
import { Preset } from './visualizer-settings/visualizer-settings.component';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss'],
  animations: [
    trigger('fadeSlideUpDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-75px)' }),
        animate('200ms', style({ opacity: 1, transform: 'translateY(0px)' })),
      ])
    ]),
  ]
})
export class ControlsComponent implements OnInit, AfterViewChecked, OnChanges {

  @Input() showControls: boolean = false;
  tabCheck: boolean = true;
  selectedTab: number = 0;
  @Input() isMobile: boolean = false;

  @Input() stationNum: number = 0;

  @Input() isLoading: boolean = true;

  @Input() selectedPreset: number = 3;
  @Output() preset: number = 3;
  @Output() presetEvent = new EventEmitter<number>();
  @Output() changeStationEvent = new EventEmitter<number>();
  @Input() presets: Array<Preset> = [];
  @Output() fullscreenEvent = new EventEmitter<boolean>();
  @Output() showSketchInfoEvent = new EventEmitter<boolean>();
  @Output() changeDeviceEvent = new EventEmitter<any>();

  constructor(public socketService: SocketService, public radioService: RadioService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewChecked(): void {
    if(this.tabCheck) {
      this.tabClick(this.selectedTab);
    }
  }

  ngOnChanges(changes: any): void {
    if(changes.selectedPreset) {      
      if(changes.selectedPreset?.currentValue !== this.preset) {
        this.preset = changes.selectedPreset.currentValue;
      }
    }
    if(changes.showControls) {
      this.tabCheck = true;
    }
  }

  /**
   * Function to change panels when clicking on a tab
   * Changes selected and the styles
   * @param select number of panel requested
   */
  tabClick(select: number): void {
    // Remove .selected from all tabs
    let allTabs = document.querySelectorAll(".tab");
    if(!allTabs) return;
    allTabs.forEach(theTab => {
      theTab.classList.remove("selected");
    });

    // Add .selected to the selected tab and set it to the panel
    let tab = document.getElementById(`tab${select}`);
    tab?.classList.add("selected");
    if(tab) {
      this.selectedTab = select;
      this.tabCheck = false;
    }
  }

  changePreset(event: any): void {
    this.presetEvent.emit(event);
  }

  changeStation(event: any): void {
    this.changeStationEvent.emit(event);
  }

  changeDevice(event: any): void {

  }

  // Logout from am_radio
  logout(): any {
    if(this.stationNum > 0) {
      this.radioService.leaveStation(this.stationNum).subscribe();
    }
    setTimeout(() => {
      localStorage.clear();
      window.location.replace(AppComponent.webURL);
    }, 1000);
  }

}

import { AfterViewChecked, AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { RadioService } from 'src/app/services/radio.service';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss']
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

import { AfterViewChecked, AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { RadioService } from 'src/app/services/radio.service';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss']
})
export class ControlsComponent implements OnInit, AfterViewChecked {

  @Input() showControls: boolean = false;
  selected: number = 0;

  @Input() stationNum: number = 0;

  @Input() isLoading: boolean = true;

  @Output() presetEvent = new EventEmitter<number>();

  constructor(public socketService: SocketService, public radioService: RadioService) { }

  ngOnInit(): void {
  }

  // So that the selected tab appears when panel is mounted
  ngAfterViewChecked(): void {
    this.tabClick(this.selected);
  }

  /**
   * Function to change panels when clicking on a tab
   * Changes selected and the styles
   * @param select number of panel requested
   */
  tabClick(select: number): void {
    // Remove .selected from all tabs
    let allTabs = document.querySelectorAll(".tab");
    allTabs.forEach(theTab => {
      theTab.classList.remove("selected");
    });

    // Add .selected to the selected tab and set it to the panel
    let tab = document.getElementById(`tab${select}`);
    tab?.classList.add("selected");
    this.selected = select;
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

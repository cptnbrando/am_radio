import { AfterViewChecked, AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss']
})
export class ControlsComponent implements OnInit, AfterViewChecked {

  @Input() showControls: boolean = false;
  selected: number = 0;

  @Input() isLoading: boolean = true;

  constructor(public socketService: SocketService) { }

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

}

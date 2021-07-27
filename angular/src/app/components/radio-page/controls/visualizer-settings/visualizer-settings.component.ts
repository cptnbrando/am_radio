import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'visualizer-settings',
  templateUrl: './visualizer-settings.component.html',
  styleUrls: ['./visualizer-settings.component.scss']
})
export class VisualizerSettingsComponent implements OnInit {
  selectedPreset: number = 1;
  @Output() presetEvent = new EventEmitter<number>();

  constructor() {

  }

  ngOnInit(): void {
  }

  change(num: number): void {
    if(num != this.selectedPreset) {
      // Remove .selected from all presets
      let allTabs = document.querySelectorAll(".preset");
      allTabs.forEach(theTab => {
        theTab.classList.remove("selected");
      });
  
      // Add .selected to the selected tab and set it to the panel
      let preset = document.getElementById(`preset${num}`);
      preset?.classList.add("selected");
  
      this.selectedPreset = num;
      this.presetEvent.emit(num);
    }
  }

}

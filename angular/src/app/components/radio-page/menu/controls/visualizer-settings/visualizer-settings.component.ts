import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export class Preset {
  id: number = 0;
  name: string = "";
  image: string = "";
  constructor(id: number, name: string, image: string) {
    this.id = id;
    this.name = name;
    this.image = '../../../../../assets/img/viz/' + image;
  }
}

@Component({
  selector: 'visualizer-settings',
  templateUrl: './visualizer-settings.component.html',
  styleUrls: ['./visualizer-settings.component.scss']
})
export class VisualizerSettingsComponent implements OnInit, AfterViewInit {
  @Input() presets: Array<Preset> = [];
  @Input() selectedPreset: number = 3;
  @Output() presetEvent = new EventEmitter<number>();

  presetChange: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    // Remove .selected from all presets
    const allTabs = document.querySelectorAll(".preset");
    allTabs.forEach(theTab => {
      theTab.classList.remove("selected");
    });

    // Add .selected to the selected tab and set it to the panel
    const preset = document.getElementById(`preset${this.selectedPreset}`);
    preset?.classList.add("selected");
  }  

  change(num: number): void {
    // Remove .selected from all presets
    const allTabs = document.querySelectorAll(".preset");
    allTabs.forEach(theTab => {
      theTab.classList.remove("selected");
    });

    // Add .selected to the selected tab and set it to the panel
    const preset = document.getElementById(`preset${num}`);
    preset?.classList.add("selected");
    
    this.presetEvent.emit(num);
  }

}

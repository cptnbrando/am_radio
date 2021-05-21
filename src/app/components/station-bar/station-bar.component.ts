import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-station-bar',
  templateUrl: './station-bar.component.html',
  styleUrls: ['./station-bar.component.scss']
})
export class StationBarComponent implements OnInit, OnChanges {

  @Input() showStationBar: boolean;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges)
  {
    
  }

}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  faPlay = faPlay;
  faPause = faPause;

  @Input() showPlaylistBar: boolean;
  @Input() showStationBar: boolean;
  @Input() isPlaying: boolean;

  @Output() toggleBarEvent = new EventEmitter<number>();
  @Output() isPlayingEvent = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
  }

  toggleBar(bar: number) {
    this.toggleBarEvent.emit(bar);
  }

  togglePlay() {
    this.isPlayingEvent.emit(true);
  }

}

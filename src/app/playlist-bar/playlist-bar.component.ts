import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-playlist-bar',
  templateUrl: './playlist-bar.component.html',
  styleUrls: ['./playlist-bar.component.scss']
})
export class PlaylistBarComponent implements OnInit, OnChanges {

  @Input() showPlaylistBar: boolean;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges)
  {
    console.log(changes);

    console.log(this.showPlaylistBar);
  }

  loadUserPlaylists(): void
  {
    
  }

}

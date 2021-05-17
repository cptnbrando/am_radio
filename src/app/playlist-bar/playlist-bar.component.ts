import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-playlist-bar',
  templateUrl: './playlist-bar.component.html',
  styleUrls: ['./playlist-bar.component.scss']
})
export class PlaylistBarComponent implements OnInit {

  @Input() showPlaylistBar: boolean;

  @Input() user;
  @Input() userPlaylists: string[];

  constructor() { }

  ngOnInit(): void {
  }

  loadUserPlaylists(): void
  {
    
  }

}

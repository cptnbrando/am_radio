import { TestBed } from '@angular/core/testing';

import { SpotifyPlayerService } from './spotify-player.service';

describe('SpotifyPlayerService', () => {
  let service: SpotifyPlayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpotifyPlayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

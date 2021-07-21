import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit } from '@angular/core';
import { Observable, Subscriber, timer } from 'rxjs';
import { SpotifyPlayerService } from 'src/app/services/spotify-player.service';

@Component({
  selector: 'app-seeker',
  templateUrl: './seeker.component.html',
  styleUrls: ['./seeker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeekerComponent implements OnInit, OnChanges {
  // Position, duration, and negative (time remaining) + string varients to display
  @Input() position: number = 0;
  positionObserver: Subscriber<string> | any;
  _position: Observable<string> = new Observable<string>(observer => {
    this.positionObserver = observer.next("0:00");
  });
  sliderPos: number = 0;

  duration: number = 0;
  _duration: string = "0:00";
  remaining: number = 0;
  _remaining: string = "-0:00";

  @Input() isPlaying: boolean = false;
  @Input() currentlyPlaying: any = {};

  @Input() isLoading: boolean = true;

  @Input() currentStation: any = {};
  @Input() stationNum: number = 0;
  sliderDisabled: boolean = false;

  constructor(private playerService: SpotifyPlayerService) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: any): void {
    console.log(changes);
    // Update the duration and begin the position timer
    if(changes.currentlyPlaying) {
      // Set duration
      this.duration = changes.currentlyPlaying.currentValue.durationMs;
      this._duration = this.formatTime(changes.currentlyPlaying.currentValue.durationMs);
      // If the track has changed and nothing else has, start the timer at 0
      if(!changes.isPlaying && this.isPlaying) {
        this.resetPosition(true);
        let seekValue = 0;
        // If the track has changed and the position has also changed, start it there
        if(changes.position) {
          seekValue = changes.position.currentValue;
        }
        this.updatePosition(seekValue);
      }
    }
    // If changes are just the position, start it at the position
    else if(changes.position) {
      this.resetPosition(false);
      this.updatePosition(changes.position.currentValue);
    }
    // Pause the timer
    if(changes.isPlaying && !this.isLoading) {
      if(changes.isPlaying.currentValue === false && changes.isPlaying.previousValue === true) {
        this.resetPosition(false);
      }
      else if(changes.isPlaying.currentValue === true && changes.isPlaying.previousValue === false) {
        this.updatePosition(this.position);
      }
    }
    // Disable the seeker on a station
    if(changes.currentStation) {
      this.resetPosition(false);
      if(changes.currentStation.currentValue.stationID === 0) {
        this.sliderDisabled = false;
      }
      else {
        this.sliderDisabled = true;
      }
    }
  }

  onSliderMove(): void {
    if(!this.isLoading) {
      this.resetPosition(false);
    }
  }

  /**
   * Seek to the time when the slider is changed
   */
  onSliderChange(): void {
    if(!this.isLoading) {
      // Advanced algebra right here
      let newPos = (this.sliderPos / 100) * this.duration;
      newPos = Math.round(newPos);
      this.playerService.seek(newPos).subscribe();
      this.resetPosition(false);
      this.updatePosition(newPos - 1000)
    }
  }

  /**
   * Used with mat-slider to print value above seeker
   * @param value value of slider
   * @returns format time for slider pos
   */
  formatLabel(value: number)  {
    if(!this.duration) return "0:00";
    value = Math.round((value / 100) * this.duration);
    return this.formatTime(value);
  }

  /**
   * Uses rxjs timer to update _position every second
   * First one has a 3.5 second delay adjusted on position if it's the beginning of the song
   * (because Spotify has a weird 1-4 second delay when a song starts)
   * @param position the starting position
   */
  updatePosition(position: number): void {
    this.position = position;
    let delay = 2000;
    if(position < 2000) delay -= position;
    else delay = 600;
    this._position = new Observable<string>(observer => {
      this.positionObserver = timer(delay, 1000).subscribe(() => {
        this.position += 1000;
        this.position = Math.round((this.position) / 1000) * 1000;
        observer.next(this.formatTime(this.position));
        this.sliderPos = (this.position / this.duration) * 100;

        // reset the timer if the position is over it
        // This shouldn't be called if the song changes, only if it repeats
        if(this.position > this.duration  + 10000) this.position = 10000;
      });
    });
    
  }

  /**
   * Helper function to reset _position to 0:00
   * @param reset whether to change the timer back to 0:00 or not
   */
  resetPosition(reset: boolean): void {
    this.positionObserver?.unsubscribe();
    if(reset) {
      this._position = new Observable<string>(observer => {
        this.positionObserver = observer.next("0:00");
      });
      this.position = 0;
    }
  }
  
  /**
   * Format a given milisecond value into a string with leading 0s
   * @param miliseconds given time in ms
   */
  formatTime(miliseconds: number): string {
    if(!miliseconds) {
      return `0:00`;
    }

    let seconds: number | string = Math.floor((miliseconds / 1000) % 60);
    let minutes: number | string = Math.floor((miliseconds / (1000 * 60)) % 60);
    let hours: number | string = Math.floor((miliseconds / (1000 * 60 * 60)) % 24);

    // Format each section with a leading 0 if needed
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    // If it's more than an hour, return the hour too. Otherwise, just the min:sec
    let time = `${minutes}:${seconds}`;
    return (hours != 0) ? `${hours}:${time}` : time;
  }
}


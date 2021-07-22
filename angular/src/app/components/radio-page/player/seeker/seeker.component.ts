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
    this.positionObserver = observer.next("00:00");
  });
  sliderPos: number = 0;

  duration: number = 0;
  _duration: string = "00:00";
  remaining: number = 0;
  _remaining: string = "-00:00";

  @Input() isPlaying: boolean = false;
  @Input() currentlyPlaying: any = {};

  @Input() isLoading: boolean = true;

  @Input() currentStation: any = {};
  @Input() stationNum: number = 0;
  sliderDisabled: boolean = false;

  isSeeking: boolean = false;
  seekValue: number = 0;

  constructor(private playerService: SpotifyPlayerService) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: any): void {
    // Update the duration and begin the position timer
    if(changes.currentlyPlaying) {
      // Set duration
      this.duration = changes.currentlyPlaying.currentValue.durationMs;
      this._duration = this.formatTime(changes.currentlyPlaying.currentValue.durationMs);
      // If the track has changed and nothing else has, start the timer at 0
      if(!changes.isPlaying && this.isPlaying) {
        this.resetPosition(true);
        this.updatePosition();
      }
    }
    // If changes are just the position, start it at the position
    else if(changes.position) {
      this.resetPosition(false);
      this.updatePosition();
    }
    // Pause the timer
    if(changes.isPlaying && !this.isLoading) {
      if(changes.isPlaying.currentValue === false && changes.isPlaying.previousValue === true) {
        this.resetPosition(false);
      }
      else if(changes.isPlaying.currentValue === true && changes.isPlaying.previousValue === false) {
        this.updatePosition();
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

  /**
   * When the slider's moving, stop the timer updates and set isSeeking to true
   */
  onSliderMove(): void {
    if(!this.isLoading) {
      this.resetPosition(false);
    }
    this.isSeeking = true;
  }

  /**
   * Seek to the time when the slider is changed
   */
  onSliderChange(): void {
    if(!this.isLoading) {
      // Advanced algebra right here
      let newPos = (this.sliderPos / 100) * this.duration;
      newPos = Math.round(newPos);
      this.seekValue = newPos;
      this.playerService.seek(newPos).subscribe(data => {
        setTimeout(() => {
          this.isSeeking = false;
        }, 600);
      });
      this.resetPosition(false);
      this.updatePosition();
    }
  }

  /**
   * Used with mat-slider to print value above seeker
   * @param value value of slider
   * @returns format time for slider pos
   */
  formatLabel(value: number)  {
    if(!this.duration) return "00:00";
    value = Math.round((value / 100) * this.duration);
    return this.formatTime(value);
  }

  /**
   * Uses window player to get the current position every .5 seconds
   * @param position the starting position
   */
  updatePosition(): void {
    this._position = new Observable<string>(observer => {
      this.positionObserver = timer(500, 500).subscribe(() => {
        if(!this.isSeeking) {
          (<any>window).spotifyPlayer.getCurrentState().then((data: any) => {
            this.position = data.position;
          });
        } else {
          this.position = this.seekValue;
        }
        observer.next(this.formatTime(this.position));
        this.sliderPos = (this.position / this.duration) * 100;
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
        this.positionObserver = observer.next("00:00");
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
      return `00:00`;
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


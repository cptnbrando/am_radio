import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, of, timer } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';

// Basically from here https://github.com/trungk18/angular-spotify/blob/main/libs/web/shell/ui/player-playback/src/lib/player-playback.component.ts

@Component({
  selector: 'app-seeker',
  templateUrl: './seeker.component.html',
  styleUrls: ['./seeker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeekerComponent implements OnInit {
  position: number = 0;
  // isSliderMoving$ = new BehaviorSubject<boolean>(false);
  // progress$ = combineLatest([this.playbackStore.playback$, this.isSliderMoving$]).pipe(
  //   debounceTime(20),
  //   switchMap(([{ paused, position }, isMoving]) => {
  //     if (paused || isMoving) {
  //       return of(position);
  //     }
  //     const progressTimer$ = timer(0, 1000);
  //     return progressTimer$.pipe(
  //       map((x) => x * 1000),
  //       map((x) => x + position)
  //     );
  //   })
  // );
  // max$ = this.playbackStore.playback$.pipe(map(({ duration }) => duration));

  constructor() { }

  ngOnInit(): void {
  }

  onChange(): void {

  }

}


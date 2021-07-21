import { AfterViewInit, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { rejects } from 'assert';
import { Observable, Subscriber, Subscription, timer } from 'rxjs';
import { SpotifyPlayerService } from 'src/app/services/spotify-player.service';
import { SpotifyService } from 'src/app/services/spotify.service';

@Component({
  selector: 'app-visualizer',
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.scss']
})
export class VisualizerComponent implements OnInit, OnChanges {
  @Input() currentlyPlaying: any = {};
  @Input() isLoading: boolean = true;
  @Input() isPlaying: boolean = false;

  analysis: any = {};
  features: any = {};

  @ViewChild("visualizer", { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;
  ctx!: CanvasRenderingContext2D;
  
  position: number;
  _position: Observable<number>;
  positionObserver: Subscriber<number> | any;

  fps: number;

  constructor(private spotifyService: SpotifyService, private playerService: SpotifyPlayerService) {
    this.position = 0;
    this._position = new Observable<number>(observer => {
      observer.next(0);
      this.positionObserver = observer;
    });

    // 16.6666 is 60fps
    // 17 is 58.823 fps
    this.fps = 16.66;
  }
  
  ngOnInit(): void {
    this.initCanvas();
  }

  ngOnChanges(changes: any): void {
    console.log(changes);
    if(changes.currentlyPlaying?.currentValue.name != "Nothing Playing" && changes.currentlyPlaying?.currentValue.id != changes.currentlyPlaying?.previousValue.id) {
      this.position = 0;
      this.setAudioData(changes.currentlyPlaying?.currentValue.id).then(() => {
        this.getPlayerData().then((data: any) => {
          console.log(data);
          if(this.isPlaying) {
            this.position = data.progress_ms;
            this.beginVisualizer();
          }
        });
      });
    }

    if(changes.isPlaying?.currentValue === false && !this.isLoading) {
      this.positionObserver?.unsubscribe();
      window.cancelAnimationFrame(1);
    }
    else if(changes.isPlaying?.currentValue === true && !this.isLoading) {
      this.beginVisualizer();
    }
  }

  beginTimer(progress: number): Observable<number> {
    console.log("beginTimer!");
    this.positionObserver?.unsubscribe();
    this._position = new Observable<number>(observer => {
      this.positionObserver = observer;
      // // this.positionObserver.next(progress);
      this.positionObserver = timer(this.fps, this.fps).subscribe(() => {
        this.position += this.fps;
        observer.next(this.position);
        // console.log(this.position);
      });
    });
    return this._position;
  }

  
  /**
   * Promise that gets audio analysis and audio features for a given trackID
   * @param trackID track to get
   * @returns audio analysis in promise
   */
  setAudioData(trackID: string): any {
    return new Promise((resolve, reject) => {
      this.getAudioFeatures(trackID).then(data => {
        this.features = data;
        console.log("FEATURES", data);
        this.getAudioAnalysis(trackID).then(data => {
          this.analysis = data;
          console.log("ANALYSIS", data);
          resolve(data);
        }, error => {
          reject(error);
        });
      }, error => {
        reject(error);
      });
    });
  }
  
  /**
   * Promise to get player data
   * @returns player data
   */
  getPlayerData(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.playerService.getPlayer().subscribe(data => {
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }
  
  /**
   * Promise to get audio features for a track
   * @param trackID the track
   * @returns array of audio features data
   */
  getAudioFeatures(trackID: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.spotifyService.getAudioFeatures(trackID).subscribe(data => {
        resolve(data);
      }, error => {
        reject(error);
      });
    })
  }
  
  /**
   * Promise to get audio analysis for a given track
   * @param trackID the track
   * @returns array of audio analysis data
   */
  getAudioAnalysis(trackID: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.spotifyService.getAudioAnalysis(trackID).subscribe(data => {
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }

  resizeCanvas(): void {
    this.canvas.nativeElement.width = window.innerWidth;
    this.canvas.nativeElement.height = window.innerHeight;
  }
  
  initCanvas(): void {
    // this.canvas = document.querySelector("canvas");
    this.ctx = <CanvasRenderingContext2D>this.canvas.nativeElement.getContext("2d");
    this.resizeCanvas();
  }

  update(): any {
    console.log();
  }

  render(): any {
    this.ctx.clearRect(0, 0, this.ctx.canvas.clientWidth, this.ctx.canvas.clientHeight);
    this.ctx.strokeStyle = "white";
    this.ctx.fillStyle = "white";
    this.ctx.fillText(String(this.position), 0, 100);
    // console.log(this.position);
    window.requestAnimationFrame(this.render.bind(this));
  }

  beginVisualizer(): void {
    // this.positionObserver?.unsubscribe();
    this.beginTimer(this.position).subscribe();
    window.requestAnimationFrame(this.render.bind(this));
  }
}

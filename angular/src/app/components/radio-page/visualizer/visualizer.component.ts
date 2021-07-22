import { ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { SpotifyService } from 'src/app/services/spotify.service';
import { Sketch } from 'src/app/shared/models/sketch.model';
import { Analysis, Bar, Beat, Section, Segment, Tatum } from 'src/app/shared/models/track.model';

@Component({
  selector: 'app-visualizer',
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.scss']
})
export class VisualizerComponent implements OnInit, OnChanges {
  @Input() currentlyPlaying: any = {};
  @Input() isLoading: boolean = true;
  @Input() isPlaying: boolean = false;

  // Currently playing track analysis and feature data
  analysis!: Analysis;
  features!: any;

  @ViewChild("visualizer", { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;
  ctx!: CanvasRenderingContext2D;
  
  position: number;
  animationLoopID: any;
  isAnimating: boolean = false;

  constructor(private spotifyService: SpotifyService) {
    this.position = 0;
  }
  
  ngOnInit(): void {
    this.initCanvas();
  }

  ngOnChanges(changes: any): void {
    console.log(changes);
    if(changes.currentlyPlaying?.currentValue.name != "Nothing Playing" && changes.currentlyPlaying?.currentValue.id != changes.currentlyPlaying?.previousValue.id) {
      this.setAudioData(changes.currentlyPlaying?.currentValue.id).then(() => {
        if(this.isPlaying) {
          this.beginVisualizer();
        }
      });
    }

    if(changes.isPlaying?.currentValue === false && !this.isLoading) {
      this.stopVisualizer();
    }
    else if(changes.isPlaying?.currentValue === true && !this.isLoading) {
      this.beginVisualizer();
    }
  }
  
  /**
   * Promise that gets audio analysis and audio features for a given trackID
   * @param trackID track to get
   * @returns audio analysis in promise
   */
  setAudioData(trackID: string): any {
    return new Promise((resolve, reject) => {
      this.spotifyService.getAudioFeatures(trackID).subscribe(data => {
        console.log("FEATURES", data);
        this.features = data;
        this.spotifyService.getAudioAnalysis(trackID).subscribe((data: Analysis) => {
          this.analysis = this.editAnalysisData(data);
          console.log("ANALYSIS", this.analysis);
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
   * We need all values in the array to be rounded to 3 decimal places
   * @param analysis the analysis object
   */
  editAnalysisData(analysis: Analysis): Analysis {
    if(!analysis) {
      return analysis;
    }
    analysis.beats.map((data: Beat) => {
      data = this.editAudioObject(data);
    });

    analysis.bars.map((data: Bar) => {
      data = this.editAudioObject(data);
    });

    analysis.sections.map((data: Section) => {
      data.measure = this.editAudioObject(data.measure);
    });

    analysis.segments.map((data: Segment) => {
      data.loudnessEnd = parseFloat(data.loudnessEnd.toFixed(3));
      data.loudnessMax = parseFloat(data.loudnessMax.toFixed(3));
      data.loudnessMaxTime = parseFloat(data.loudnessMaxTime.toFixed(3));
      data.loudnessStart = parseFloat(data.loudnessStart.toFixed(3));
      data.measure = this.editAudioObject(data.measure);
    });

    analysis.tatums.map((data: Tatum) => {
      data = this.editAudioObject(data);
    });

    return analysis;
  }

  editAudioObject(data: Beat | Bar | Tatum): any {
    data.confidence = parseFloat(data.confidence.toFixed(3));
    data.duration = parseFloat(data.duration.toFixed(3));
    data.start = parseFloat(data.start.toFixed(3));
    return data;
  }

  resizeCanvas(): void {
    this.canvas.nativeElement.width = window.innerWidth;
    this.canvas.nativeElement.height = window.innerHeight;
  }
  
  initCanvas(): void {
    this.ctx = <CanvasRenderingContext2D>this.canvas.nativeElement.getContext("2d");
    this.resizeCanvas();
  }

  frameKeep = 0;

  /**
   * Game loop to render sketches
   */
  render(): void {
    this.frameKeep++;
    if(this.frameKeep > 10) {
      this.ctx.clearRect(0, 0, this.ctx.canvas.clientWidth, this.ctx.canvas.clientHeight);
      this.frameKeep = 0;
    }
    this.drawFrame();
    this.ctx.beginPath();
    this.ctx.strokeStyle = "white";
    this.ctx.fillStyle = "white";
    this.ctx.fillText(String((this.position / 1000).toFixed(0)), 0, 100);
    this.ctx.closePath();
    this.animationLoopID = window.requestAnimationFrame(this.render.bind(this));
  }

  /**
   * Draw one frame according to a given sketch
   * @param sketch selected sketch
   */
  drawFrame(): void {
    // We can get the exact current position every frame from the spotify sdk web player
    (<any>window).spotifyPlayer.getCurrentState().then((data: any) => {
      this.position = data.position;
      let sketch = new Sketch(data.position, this.analysis);
      sketch.setValues(this.analysis, this.position).then(() => {
        sketch.paint(this.ctx, this.position);
      });
    });
  }

  /**
   * Start the visualizer with requestAnimationFrame
   */
  beginVisualizer(): void {
    if(!this.isAnimating) {
      window.requestAnimationFrame(this.render.bind(this));
      this.isAnimating = true;
    }
  }

  /**
   * Stop the visualizer
   */
  stopVisualizer(): void {
    window.cancelAnimationFrame(this.animationLoopID);
    this.isAnimating = false;
  }
}

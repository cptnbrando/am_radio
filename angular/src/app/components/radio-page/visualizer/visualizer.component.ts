import { ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { SpotifyService } from 'src/app/services/spotify.service';
import { Sketch } from 'src/app/shared/models/sketch.model';
import { Adventure } from 'src/app/shared/models/sketches/adventure.sketch';
import { Testing123 } from 'src/app/shared/models/sketches/testing123.sketch';
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

  // Keeping track of track progress for faster array parsing
  beatIndex: number = 0;
  barIndex: number = 0;
  sectionIndex: number = 0;
  sectionMeasures: Array<Bar> = [];
  segmentIndex: number = 0;
  segmentMeasures: Array<Bar> = [];
  tatumIndex: number = 0;

  @ViewChild("visualizer", { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;
  ctx!: CanvasRenderingContext2D;
  
  position: number;
  animationLoopID: any;
  isAnimating: boolean = false;

  selectedSketch!: Sketch;
  currentSketch!: Sketch;

  constructor(private spotifyService: SpotifyService) {
    this.position = 0;
  }
  
  ngOnInit(): void {
    this.initCanvas();
  }

  // Start and stop the visualizer based on changes to input values
  ngOnChanges(changes: any): void {
    // console.log(changes);
    // We never want the visualizer to be playing when nothing's playing
    if(this.currentlyPlaying.name != "Nothing Playing") {
      // If there's a new track playing, get and set the new analysis/features data
      if(changes.currentlyPlaying?.currentValue.id != changes.currentlyPlaying?.previousValue.id) {
        this.setAudioData(changes.currentlyPlaying?.currentValue.id).then(() => {
          // If it's playing, start the visualizer
          if(this.isPlaying) {
            this.beginVisualizer();
          }
        });
      }
      // If isPlaying is changed to false, meaning the player was paused, stop the visualizer. Start it on true
      if(changes.isPlaying?.currentValue === false && !this.isLoading) {
        this.stopVisualizer();
      }
      else if(changes.isPlaying?.currentValue === true && !this.isLoading) {
        this.beginVisualizer();
      }
      // If isLoading is changed to true, stop the visualizer. Start it if it's false
      if(changes.isLoading?.currentValue === true) {
        this.stopVisualizer();
      }
      else if(changes.isLoading?.currentValue === false && this.isPlaying) {
        this.beginVisualizer();
      }
    } else {
      this.stopVisualizer();
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
        // console.log("FEATURES", data);
        this.features = data;
        this.spotifyService.getAudioAnalysis(trackID).subscribe((data: Analysis) => {
          this.analysis = this.editAnalysisData(data);
          // console.log("ANALYSIS", this.analysis);
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

    this.sectionMeasures = [];
    analysis.sections.map((data: Section) => {
      data.measure = this.editAudioObject(data.measure);
      this.sectionMeasures.push(data.measure);
    });
    // this.sectionMeasures = sectionMs;

    this.segmentMeasures = [];
    analysis.segments.map((data: Segment) => {
      data.loudnessEnd = parseFloat(data.loudnessEnd.toFixed(3));
      data.loudnessMax = parseFloat(data.loudnessMax.toFixed(3));
      data.loudnessMaxTime = parseFloat(data.loudnessMaxTime.toFixed(3));
      data.loudnessStart = parseFloat(data.loudnessStart.toFixed(3));
      data.measure = this.editAudioObject(data.measure);
      this.segmentMeasures.push(data.measure);
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
      this.drawInfo();
    }
    this.drawFrame();
    this.animationLoopID = window.requestAnimationFrame(this.render.bind(this));
  }

  /**
   * Draw one frame according to a given sketch
   * @param sketch selected sketch
   */
  drawFrame(): void {
    // We can get the exact current position every frame from the spotify sdk web player
    let startTime = performance.now();
    (<any>window).spotifyPlayer.getCurrentState().then((data: any) => {
      this.position = data.position;
      let sketch = new Adventure(this.position, this.analysis);
      this.currentSketch = sketch;
      let indexArray = [this.beatIndex, this.barIndex, this.sectionIndex, this.segmentIndex, this.tatumIndex];
      sketch.setValues(indexArray, this.sectionMeasures, this.segmentMeasures).then(() => {
        let timeTaken = performance.now() - startTime;
        // We measure the time it takes to offset any slow measurements (2-3 ms delay to get position from player :/)
        // Store the indexes so that subsequent array parsing can start right next to when the last one ended
        this.beatIndex = sketch.beatIndex;
        this.barIndex = sketch.barIndex;
        this.tatumIndex = sketch.tatumIndex;
        this.sectionIndex = sketch.sectionIndex;
        this.segmentIndex = sketch.segmentIndex;
        sketch.paint(this.ctx, this.position + timeTaken);
      });
    });
  }

  /**
   * Draws the selected sketch's info
   */
  drawInfo(): void {
    this.ctx.beginPath();
    this.ctx.strokeStyle = "white";
    this.ctx.fillStyle = "white";
    this.ctx.font = '15px Source Code Pro';
    // Sketch info
    this.ctx.fillText(`Sketch: ${this.selectedSketch.name}`, 20, 35);
    this.ctx.fillText(`Created By: ${this.selectedSketch.creator}`, 20, 65);
    // Track info
    this.ctx.fillText(`Now Playing: ${this.currentlyPlaying.name}`, 20, this.ctx.canvas.height - 65);
    this.ctx.fillText(`By: ${this.currentlyPlaying.artists[0].name}`, 20, this.ctx.canvas.height - 35);
    this.ctx.closePath();
  }

  /**
   * Start the visualizer with requestAnimationFrame
   */
  beginVisualizer(): void {
    if(!this.isAnimating && this.analysis && this.features) {
      this.selectedSketch = new Adventure(this.position, this.analysis);
      this.frameKeep = this.selectedSketch.rate;
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

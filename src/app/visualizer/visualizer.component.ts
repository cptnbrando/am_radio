import { HostListener } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import butterchurn from 'butterchurn';
import butterchurnPresets from 'butterchurn-presets';
import { SpotifyService } from '../spotify.service';

@Component({
  selector: 'app-visualizer',
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.scss']
})
export class VisualizerComponent implements OnInit 
{
  canvas: any;

  constructor() {

  }

  ngOnInit(): void 
  {
    // Get the canvas - set it's width and height to the right values
    this.canvas = document.querySelector("canvas");
    window.addEventListener('resize', this.resizeCanvas, false);
    this.resizeCanvas();

    // const audioCtx = new AudioContext();
    // const analyserNode = new AnalyserNode(audioCtx, {
    //   fftSize: 2048,
    //   maxDecibels: -25,
    //   minDecibels: -60,
    //   smoothingTimeConstant: 0.5,
    // });

    // const visualizer = butterchurn.createVisualizer(audioCtx, canvas, {
    //   width: 800,
    //   height: 600
    // });

    // visualizer.connectAudio(analyserNode);

    // // load a preset

    // const presets = butterchurnPresets.getPresets();
    // const preset = presets['Flexi, martin + geiss - dedicated to the sherwin maxawow'];

    // visualizer.loadPreset(preset, 0.8); // 2nd argument is the number of seconds to blend presets

    // // resize visualizer

    // visualizer.setRendererSize(1600, 1200);

    // // render a frame

    // visualizer.render();
  }

  resizeCanvas(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

}

import * as d3 from 'd3-interpolate';
import { Sketch } from "../sketch.model";
import { Time } from "../time.model";
import { Analysis, Bar, Beat, Tatum } from "../track.model";

/**
 * Circles man, the first sketch
 */
export class Testing123 extends Time implements Sketch {
    name: string = "testing_testing_123";
    creator: string = "Captain Brando!";
    rate: number = 10;
    constructor(position: number, analysis: Analysis) {
        super(position, analysis);
    }

    paint(ctx: CanvasRenderingContext2D, position: number): void {
        ctx.beginPath();
        ctx.strokeStyle = "white";
        ctx.fillStyle = "white";
        ctx.lineWidth = 6;
        let circleX = ctx.canvas.width / 2;
        let circleY = ctx.canvas.height / 2;
        let confidence = this.getConfidence(position, this.beat);
        let radius = Math.abs(confidence * 750);
        ctx.arc(circleX, circleY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
    }

    /**
     * Let's talk beats...
     * Spotify gives us when each beats starts, the confidence, and how long the beat lasts
     * 
     * Every Sketch, and every position, will belong to a beat,
     * but after the start, the beat will (usually) drop in volume until the next one hits
     * 
     * We can use d3-interpolate on the confidence.
     * First we find which beat this position belongs to,
     * next we make a d3 number from the confidence found to 0 (or the lowest value a kick should go)
     * then we use the position to find the percentage of how close we are to the end of the beat
     * position to s = position / 1000 (value of confidence values) (use .toFixed(3) so they have the same amount of decimals)
     * 
     * Example beats:
     * 0: {confidence: 0.831, duration: 0.29325, start: 0.52145}
     * 1: {confidence: 0.602, duration: 0.29007, start: 0.8147}
     * 2: {confidence: 0.633, duration: 0.29368, start: 1.10476}
     * 3: {confidence: 0.32, duration: 0.29292, start: 1.39844}
     */
    
    /**
     * Uses d3-interpolate to find a value between the current beat confidence and 0
     * @param position the current position
     * @returns an interpolated confidence value for the current beat
     */
    getConfidence(position: number, type: Beat | Bar | Tatum): number {
        // Confidence is always between 0 and 1
        let confidence_d3 = d3.interpolateNumber(.01, type.confidence);
        let difference = parseFloat((position / 1000).toFixed(3)) - type.start;
        // We use the next beat in case the posiition is past
        if(difference < 0) {
            type = this.analysis.beats[this.beatIndex + 1];
            difference = parseFloat((position / 1000).toFixed(3)) - type.start;
            confidence_d3 = d3.interpolateNumber(.01, type.confidence);
        }
        return confidence_d3(difference / type.duration);
    }
}

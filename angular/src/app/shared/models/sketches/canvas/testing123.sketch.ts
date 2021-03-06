import * as d3 from 'd3-interpolate';
import { Sketch } from "../../sketch.model";
import { Time } from "../../time.model";
import { Analysis, Bar, Beat, Tatum } from "../../track.model";

/**
 * Circles man, the first sketch
 */
export class Testing123 extends Time implements Sketch {
    name: string = "testing_testing_123";
    creator: string = "Captain Brando!";
    offset: number = 0;
    constructor(position: number, analysis: Analysis) {
        super(position, analysis);
    }

    paint(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.strokeStyle = "white";
        ctx.fillStyle = "white";
        ctx.lineWidth = 6;
        let circleX = ctx.canvas.width / 2;
        let circleY = ctx.canvas.height / 2;
        let confidence = this.getConfidence(this.beat);
        let radius = Math.abs(confidence * 750);
        ctx.arc(circleX, circleY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
    }

    static frameKeep: number = 0;
    static frameRate: number = 10;

    loop(ctx: CanvasRenderingContext2D): Promise<any> {
        return new Promise((resolve, reject) => {
            this.paint(ctx);
            Testing123.frameKeep++;
            if(Testing123.frameKeep > Testing123.frameRate) {
                ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
                Testing123.frameKeep = 0;
            }
            resolve(Testing123.frameKeep);
        });
    }

    reset(): void {
        Testing123.frameKeep = 0;
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
    getConfidence(type: Beat | Bar | Tatum): number {
        // Confidence is always between 0 and 1
        let confidence_d3 = d3.interpolateNumber(type.confidence, .01);
        let difference = Math.abs(this.roundPos(this.position) - type.start);
        return confidence_d3(difference / type.duration);
    }
}

import * as d3 from 'd3-interpolate';
import { Sketch } from "../sketch.model";
import { Time } from "../time.model";
import { Analysis, Bar, Beat, Tatum } from "../track.model";

export class Adventure extends Time implements Sketch {
    name: string = "adventure...!";
    creator: string = "Captain Brando!";
    rate: number = 5;
    constructor(position: number, analysis: Analysis) {
        super(position, analysis);
    }

    paint(ctx: CanvasRenderingContext2D, position: number): void {
        ctx.beginPath();
        let color = this.getColor(this.position, this.tatum, []);
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 7;
        let circleX = this.getX(ctx, position, this.bar);
        let circleY = ctx.canvas.height / 2;
        let confidence = this.getConfidence(position, this.tatum);
        let radius = Math.abs(confidence * 750);
        ctx.arc(circleX, circleY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
    }

    /**
     * Gets a value relating current position to canvas x coordinate
     * @param ctx canvas to check
     * @param position current position
     * @param bar bar to check
     */
    getX(ctx: CanvasRenderingContext2D, position: number, bar: Bar): number {
        // Return x from 10 to end of canvas
        let progress_d3 = d3.interpolateNumber(10, ctx.canvas.width - 10);
        let progress = parseFloat((position / 1000).toFixed(3)) - bar.start;
        // We use the next bar in case the posiition is past
        if(progress < 0) {
            bar = this.analysis.bars[this.barIndex + 1];
            progress = parseFloat((position / 1000).toFixed(3)) - bar.start;
        }
        return progress_d3(progress / bar.duration);
    }

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

    getColor(position: number, type: Beat | Bar | Tatum, colors: any[]): string {
        let color_d3 = d3.interpolateLab("red", "blue");
        let difference = parseFloat((position / 1000).toFixed(3)) - type.start;
        if(difference < 0) {
            type = this.analysis.tatums[this.tatumIndex + 1];
            difference = parseFloat((position / 1000).toFixed(3)) - type.start;
        }

        return color_d3(difference / type.duration);
    }

}

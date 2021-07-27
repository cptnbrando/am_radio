import * as d3 from 'd3-interpolate';
import { Sketch } from "../sketch.model";
import { Time } from "../time.model";
import { Analysis, Bar, Beat, Tatum } from "../track.model";

export class Adventure extends Time implements Sketch {
    name: string = "adventure...!";
    creator: string = "Captain Brando!";
    offset: number = 19;
    constructor(position: number, analysis: Analysis) {
        super(position, analysis);
    }
    
    paint(ctx: CanvasRenderingContext2D, position: number): void {
        let startTime = performance.now();
        ctx.beginPath();
        let timeTaken = performance.now() - startTime;
        let color = this.getColor(position + timeTaken, this.tatum);
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 7;
        timeTaken = performance.now() - startTime;
        let posX = this.getX(ctx, position, this.bar);
        let posY = ctx.canvas.height / 2;
        timeTaken = performance.now() - startTime;
        let confidence = this.getConfidence(position + timeTaken, this.tatum);
        
        ctx.moveTo(posX, posY);
        ctx.lineTo(posX, posY - Math.abs(confidence * 750));
        // ctx.moveTo(posX, posY);
        ctx.lineTo(posX, posY + Math.abs(confidence * 750));
        
        ctx.stroke();
        ctx.closePath();
    }

    static barCount: number = 0;

    /**
     * Paints a new sketch with every new bar
     * @param ctx context
     * @param position current position
     * @returns Promise that paints the sketch, increases static barCount, and clears the canvas after every bar
     */
    loop(ctx: CanvasRenderingContext2D, position: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this.paint(ctx, position);
            if(this.barIndex > Adventure.barCount) {
                ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
                Adventure.barCount++;
                if(this.barIndex != Adventure.barCount) {
                    Adventure.barCount = this.barIndex;
                }
            }
            resolve(Adventure.barCount);
        });
    }

    reset(): void {
        Adventure.barCount = 0;
        Adventure.chosenColors = [Adventure.colors[Math.floor(Math.random()*Adventure.colors.length)], Adventure.colors[Math.floor(Math.random()*Adventure.colors.length)]];
    }
    
    /**
     * Gets a value relating current position to canvas x coordinate
     * @param ctx canvas to check
     * @param position current position
     * @param bar bar to check
     */
    getX(ctx: CanvasRenderingContext2D, position: number, bar: Bar): number {
        // Return x from 10 to end of canvas
        let progress_d3 = d3.interpolateNumber(0, ctx.canvas.width);
        let progress = parseFloat((position / 1000).toFixed(3)) - bar.start;
        // We use the next bar in case the posiition is past
        if(progress < 0) {
            bar = this.analysis.bars[this.barIndex + 1];
            this.bar = bar;
            progress = parseFloat((position / 1000).toFixed(3)) - bar.start;
        }
        return progress_d3(progress / bar.duration);
    }

    /**
     * Uses d3-interpolate to find a value between the current beat confidence and 0
     * @param position the current position
     * @returns an interpolated confidence value for the current beat
     */
    getConfidence(position: number, tatum: Tatum): number {
        // Confidence is always between 0 and 1
        let confidence_d3 = d3.interpolateNumber(.01, tatum.confidence);
        let difference = parseFloat((position / 1000).toFixed(3)) - tatum.start;
        // We use the next beat in case the posiition is past
        if(difference < 0) {
            tatum = this.analysis.beats[this.beatIndex + 1];
            difference = parseFloat((position / 1000).toFixed(3)) - tatum.start;
            confidence_d3 = d3.interpolateNumber(.01, tatum.confidence);
        }
        return confidence_d3(difference / tatum.duration);
    }

    static colors: string[] = ["red", "blue", "yellow", "green", "white", "purple", "orange", "aqua"];
    static chosenColors: string[] = [Adventure.colors[Math.floor(Math.random()*Adventure.colors.length)], Adventure.colors[Math.floor(Math.random()*Adventure.colors.length)]];
    static sectionCount: number = 0;

    getColor(position: number, tatum: Beat | Bar | Tatum): string {
        if(this.sectionIndex > Adventure.sectionCount) {
            Adventure.sectionCount++;
            let color1 = Adventure.colors[Math.floor(Math.random()*Adventure.colors.length)];
            let color2 = Adventure.colors[Math.floor(Math.random()*Adventure.colors.length)];
            Adventure.chosenColors = [color1, color2];
            if(this.sectionIndex != Adventure.sectionCount) Adventure.sectionCount = this.sectionIndex;
        }
        let color_d3 = d3.interpolateLab(Adventure.chosenColors[0], Adventure.chosenColors[1]);
        let difference = parseFloat((position / 1000).toFixed(3)) - tatum.start;
        if(difference < 0) {
            tatum = this.analysis.tatums[this.tatumIndex + 1];
            difference = parseFloat((position / 1000).toFixed(3)) - tatum.start;
        }

        return color_d3(difference / tatum.duration);
    }

}

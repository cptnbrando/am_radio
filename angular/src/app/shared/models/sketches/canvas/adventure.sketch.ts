import * as d3 from 'd3-interpolate';
import { Sketch } from "../../sketch.model";
import { Time } from "../../time.model";
import { Analysis, Bar, Beat, Tatum } from "../../track.model";

export class Adventure extends Time implements Sketch {
    name: string = "adventure...!";
    creator: string = "Captain Brando!";
    offset: number = 420;
    isMobile: boolean;
    constructor(position: number, analysis: Analysis, isMobile: boolean) {
        super(position, analysis);
        this.isMobile = isMobile;
    }

    static barCount: number = 0;
    static colors: string[] = ["red", "blue", "yellow", "green", "white", "purple", "orange", "aqua"];
    static chosenColors: string[] = [Adventure.colors[Math.floor(Math.random()*Adventure.colors.length)], Adventure.colors[Math.floor(Math.random()*Adventure.colors.length)]];
    static sectionCount: number = 0;
    
    paint(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        const color = this.getColor(this.position, this.tatum);
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = (this.isMobile) ? 1 : 7;

        const posX = this.getX(ctx, this.bar);
        const posY = ctx.canvas.height / 2;

        const confidence = this.getConfidence(this.position, this.tatum);
        ctx.moveTo(posX, posY);
        const max = 500;
        ctx.lineTo(posX, posY - Math.abs(confidence * max));
        ctx.lineTo(posX, posY + Math.abs(confidence * max));
        
        ctx.stroke();
        ctx.closePath();
    }

    sync(): void {

    }

    /**
     * Paints a new sketch with every new bar
     * @param ctx context
     * @param position current position
     * @returns Promise that paints the sketch, increases static barCount, and clears the canvas after every bar
     */
    loop(ctx: CanvasRenderingContext2D): Promise<any> {
        return new Promise((resolve, reject) => {
            this.paint(ctx);
            if(Adventure.barCount !== Time.barIndex) {
                ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
                // this.sync();
                Adventure.barCount = Time.barIndex;
            }
            resolve(Adventure.barCount);
        });
    }

    changeColors(): void {
        if(Time.sectionIndex != Adventure.sectionCount) {
            Adventure.sectionCount = Time.sectionIndex;
            let color1 = Adventure.colors[Math.floor(Math.random()*Adventure.colors.length)];
            let color2 = Adventure.colors[Math.floor(Math.random()*Adventure.colors.length)];
            Adventure.chosenColors = [color1, color2];
        }
    }

    reset(): void {
        Adventure.barCount = Time.barIndex;
        Adventure.chosenColors = [Adventure.colors[Math.floor(Math.random()*Adventure.colors.length)], Adventure.colors[Math.floor(Math.random()*Adventure.colors.length)]];
        Adventure.sectionCount = Time.sectionIndex;
    }
    
    /**
     * Gets a value relating current position to canvas x coordinate
     * @param ctx canvas to check
     * @param position current position
     * @param bar bar to check
     */
    getX(ctx: CanvasRenderingContext2D, bar: Bar): number {
        // Return x from 10 to end of canvas
        this.changeColors();
        let progress_d3 = d3.interpolateNumber(ctx.canvas.width, 0);
        let progress = Math.abs(this.roundPos(this.position) - bar.start);
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
        let difference = Math.abs(parseFloat((position / 1000).toFixed(3)) - tatum.start);
        return confidence_d3(difference / tatum.duration);
    }

    getColor(position: number, tatum: Beat | Bar | Tatum): string {
        let color_d3 = d3.interpolateLab(Adventure.chosenColors[0], Adventure.chosenColors[1]);
        let difference = Math.abs(parseFloat((position / 1000).toFixed(3)) - tatum.start);

        return color_d3(difference / tatum.duration);
    }
}

import * as d3 from 'd3-interpolate';
import { Sketch } from "../../sketch.model";
import { Time } from "../../time.model";
import { Analysis, Bar, Beat, Segment, Tatum } from "../../track.model";

export class RollerCoaster extends Time implements Sketch {
    name: string = "RollerCoaster 🎢";
    creator: string = "Captain Brando!";
    offset: number = 420;
    constructor(position: number, analysis: Analysis) {
        super(position, analysis);
    }

    static barCount: number = 0;
    static colors: string[] = ["red", "blue", "yellow", "green", "white", "purple", "orange", "aqua"];
    static chosenColors: string[] = [RollerCoaster.colors[Math.floor(Math.random()*RollerCoaster.colors.length)], RollerCoaster.colors[Math.floor(Math.random()*RollerCoaster.colors.length)]];
    static sectionCount: number = 0;
    
    paint(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        const color = this.getColor(this.position, this.tatum);
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 7;

        const posX = this.getX(ctx, this.bar);
        const posY = ctx.canvas.height;

        const confidence = this.getLoudness(this.position, this.segment);
        ctx.moveTo(posX, posY);
        const max = 18;
        let diff = Math.abs(confidence * max);
        if(diff >= ctx.canvas.height) {
            diff = ctx.canvas.height - 20;
        }
        ctx.lineTo(posX, posY - diff);
        
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
            if(RollerCoaster.barCount !== Time.barIndex) {
                ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
                // this.sync();
                RollerCoaster.barCount = Time.barIndex;
            }
            this.paint(ctx);
            resolve(RollerCoaster.barCount);
        });
    }

    changeColors(): void {
        if(Time.sectionIndex != RollerCoaster.sectionCount) {
            RollerCoaster.sectionCount = Time.sectionIndex;
            let color1 = RollerCoaster.colors[Math.floor(Math.random()*RollerCoaster.colors.length)];
            let color2 = RollerCoaster.colors[Math.floor(Math.random()*RollerCoaster.colors.length)];
            RollerCoaster.chosenColors = [color1, color2];
        }
    }

    reset(): void {
        RollerCoaster.barCount = Time.barIndex;
        RollerCoaster.chosenColors = [RollerCoaster.colors[Math.floor(Math.random()*RollerCoaster.colors.length)], RollerCoaster.colors[Math.floor(Math.random()*RollerCoaster.colors.length)]];
        RollerCoaster.sectionCount = Time.sectionIndex;
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
     * Uses d3-interpolate to find a value between the current segment loudnessStart and the loudnessEnd
     * 
     * loudnessStart: -22.179
     * loudnessMax: -16.851
     * loudnessMaxTime: 0.005
     * loudnessEnd: -24.894
     * 
     * loudnessStart: -24.894
     * loudnessMax: -19.689
     * loudnessMaxTime: 0.011
     * loudnessEnd: -32.327
     * 
     * @param position the current position
     * @returns an interpolated confidence value for the current segment
     */
    getLoudness(position: number, segment: Segment): number {
        const pos = this.roundPos(position);
        const difference = Math.abs(pos) - segment.measure.start;
        const loudTime = segment.measure.start + segment.loudnessMaxTime;
        let loudness_d3;
        switch(pos < loudTime) {
            case true:
                loudness_d3 = d3.interpolateNumber(segment.loudnessStart, segment.loudnessMax);
                break;
            case false:
                loudness_d3 = d3.interpolateNumber(segment.loudnessMax, segment.loudnessEnd);
                break;
        }
        return Math.abs(loudness_d3(difference / segment.measure.duration));
    }

    getColor(position: number, tatum: Beat | Bar | Tatum): string {
        let color_d3 = d3.interpolateLab(RollerCoaster.chosenColors[0], RollerCoaster.chosenColors[1]);
        let difference = Math.abs(parseFloat((position / 1000).toFixed(3)) - tatum.start);

        return color_d3(difference / tatum.duration);
    }

}
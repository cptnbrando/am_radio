import * as d3 from 'd3-interpolate';
import { Sketch } from "../../sketch.model";
import { Time } from "../../time.model";
import { Analysis } from "../../track.model";

export class WalkieTalkie extends Time implements Sketch {
    name: string = "Walkie Talkie";
    creator: string = "Captain Brando!";
    offset: number = 0;
    isMobile: boolean;
    size: number;
    nodes: Array<number>;
    mousePos: Array<number>;
    constructor(position: number, analysis: Analysis, isMobile: boolean, mousePos: Array<number>) {
        super(position, analysis);
        this.isMobile = isMobile;
        this.mousePos = mousePos;

        // Less nodes on mobile
        // More nodes on desktop depending on track intensity
        this.size = (isMobile) ? 4 : Math.floor(Time.beatConfAvg * 10) + 1;
        this.nodes = [];
        for(let i = 0; i < this.size; i++) {
            this.nodes.push(0);
        }
    }

    paint(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        const color = WalkieTalkie.chosenColor;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 7;

        const gap = (this.isMobile) ? 0 : 100 - (this.mousePos[1] * .1);
        const space = (this.isMobile) ? 0 : this.mousePos[0] * .05;
        
        // Set midpoint to beat confidence
        const midX = ctx.canvas.width / 2;
        const actualMidY = ctx.canvas.height / 2;
        const confidence = this.getConfidence();
        let midY = actualMidY;
        this.nodes[0] = (confidence * 1000 > midY) ? midY : confidence * 1000;
        for(let i = 1; i < this.nodes.length; i++) {
            let conf = (confidence * ((this.size - i) / this.size)) * 1000;
            this.nodes[i] = (conf > midY) ? midY : conf;
        }
        
        ctx.moveTo(0, midY);

        let quarter = ctx.canvas.width * (1 / (this.size * 2));
        let xPos = 0;
        let base = 0;
        
        for(let i = this.size - 1; i > 0; i--) {
            midY = actualMidY - gap;
            xPos = (this.size - i) * (quarter / 2);
            base = (this.size - i) * quarter;
            base += space;
            ctx.lineTo(xPos, midY - this.nodes[i]);
            ctx.lineTo(base, midY);
            midY = actualMidY + gap;
            ctx.moveTo((this.size - i) * quarter, midY);
            ctx.lineTo(xPos, midY + this.nodes[i]);
            ctx.lineTo(base, midY);
        }

        midY = actualMidY;
        
        ctx.moveTo(midX - (quarter / 2), midY);
        ctx.lineTo(midX, midY - Math.abs(this.nodes[0]));
        ctx.lineTo(midX + (quarter / 2), midY);
        
        ctx.moveTo(midX - (quarter / 2), midY);
        ctx.lineTo(midX, midY + Math.abs(this.nodes[0]));
        ctx.lineTo(midX + (quarter / 2), midY);
        
        const canvasWidth = ctx.canvas.width;
        ctx.moveTo(canvasWidth, midY);
        for(let i = this.size - 1; i > 0; i--) {
            midY = actualMidY - gap;
            xPos = ((this.size - i) * (quarter / 2));
            base = canvasWidth - ((this.size - i) * quarter);
            base -= space;
            ctx.lineTo(canvasWidth - xPos, midY - this.nodes[i]);
            ctx.lineTo(base, midY);
            midY = actualMidY + gap;
            ctx.moveTo(base, midY);
            ctx.lineTo(canvasWidth - xPos, midY + this.nodes[i]);
            ctx.lineTo(base, midY);
        }
        
        ctx.stroke();
        ctx.closePath();
    }
    
    static colors: string[] = ["red", "blue", "yellow", "green", "white", "purple", "orange", "aqua"];
    static chosenColor: string = WalkieTalkie.colors[Math.floor(Math.random()*WalkieTalkie.colors.length)];
    static frameRate: number = 10;
    static frameKeep: number = 0;

    static barCount: number = 0;
    static colorCount: number = 0;
    static colorMax: number = 0;
    loop(ctx: CanvasRenderingContext2D): Promise<any> {
        return new Promise((resolve) => {
            this.paint(ctx);
            if(WalkieTalkie.frameKeep > WalkieTalkie.frameRate) {
                ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
                WalkieTalkie.frameKeep = 0;
            }

            // Every bar, we set the max frames to use before swapping the color according to the confidence of the bar
            // It's 10 - the value because higher confidence means we swap colors faster, or require less frames to swap
            if(WalkieTalkie.barCount !== Time.barIndex) {
                WalkieTalkie.barCount = Time.barIndex;
                const barConf = Math.floor(10 - (this.analysis.bars[WalkieTalkie.barCount].confidence * 10)) + 5;
                WalkieTalkie.colorMax = (barConf < 0) ? 0 : barConf;
            }

            // We use a simple static counter to swap the colors according to the bar confidence
            if(WalkieTalkie.colorCount > WalkieTalkie.colorMax) {
                WalkieTalkie.colorCount = 0;
                WalkieTalkie.chosenColor = WalkieTalkie.colors[Math.floor(Math.random()*WalkieTalkie.colors.length)];
            }
            WalkieTalkie.colorCount++;
            WalkieTalkie.frameKeep++;
            resolve(true);
        });
    }

    reset(): void {
        WalkieTalkie.frameKeep = 0;
        WalkieTalkie.barCount = 0;
        WalkieTalkie.colorCount = 0;
        WalkieTalkie.colorMax = 0;
    }

    /**
     * Uses d3-interpolate to find a value between the current beat confidence and 0
     * @param position the current position
     * @returns an interpolated confidence value for the current beat
     */
    getConfidence(): number {
        const beat = this.beat;
        // Confidence is always between 0 and 1
        let confidence_d3 = d3.interpolateNumber(beat.confidence, 0);
        let difference = Math.abs(this.roundPos(this.position) - beat.start);
        return confidence_d3(difference / beat.duration);
    }
}

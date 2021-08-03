import * as d3 from 'd3-interpolate';
import { Sketch } from "../../sketch.model";
import { Time } from "../../time.model";
import { Analysis, Beat, Tatum } from "../../track.model";
import { RollerCoaster } from "./coaster.sketch";

export class WalkieTalkie extends Time implements Sketch {
    name: string = "Walkie Talkie";
    creator: string = "Captain Brando!";
    offset: number = 0;
    isMobile: boolean;
    size: number;
    nodes: Array<number>;
    constructor(position: number, analysis: Analysis, isMobile: boolean) {
        super(position, analysis);
        this.isMobile = isMobile;

        // Less nodes on mobile
        this.size = (isMobile) ? 3 : 5
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
        
        // Set midpoint to beat confidence
        const midX = ctx.canvas.width / 2;
        const midY = ctx.canvas.height / 2;
        const confidence = this.getConfidence();
        this.nodes[0] = (confidence * 1000 > midY) ? midY : confidence * 1000;
        for(let i = 1; i < this.nodes.length; i++) {
            let conf = (confidence * ((this.size - i) / this.size)) * 1000;
            this.nodes[i] = (conf > midY) ? midY : conf;
        }
        
        ctx.moveTo(0, midY);

        let quarter = ctx.canvas.width * (1 / (this.size * 2));
        let xPos = 0;
        
        for(let i = this.size - 1; i > 0; i--) {
            xPos = (this.size - i) * (quarter / 2);
            ctx.lineTo(xPos, midY - this.nodes[i]);
            ctx.lineTo((this.size - i) * quarter, midY);
            
            ctx.moveTo((this.size - i) * quarter, midY);
            ctx.lineTo(xPos, midY + this.nodes[i]);
            ctx.lineTo((this.size - i) * quarter, midY);
        }
        
        ctx.moveTo(midX - (quarter / 2), midY);
        ctx.lineTo(midX, midY - Math.abs(this.nodes[0]));
        ctx.lineTo(midX + (quarter / 2), midY);
        
        ctx.moveTo(midX - (quarter / 2), midY);
        ctx.lineTo(midX, midY + Math.abs(this.nodes[0]));
        ctx.lineTo(midX + (quarter / 2), midY);
        
        const canvasWidth = ctx.canvas.width;
        ctx.moveTo(canvasWidth, midY);
        for(let i = this.size - 1; i > 0; i--) {
            xPos = ((this.size - i) * (quarter / 2));
            ctx.lineTo(canvasWidth - xPos, midY - this.nodes[i]);
            ctx.lineTo(canvasWidth - ((this.size - i) * quarter), midY);
            
            ctx.moveTo(canvasWidth - ((this.size - i) * quarter), midY);
            ctx.lineTo(canvasWidth - xPos, midY + this.nodes[i]);
            ctx.lineTo(canvasWidth - ((this.size - i) * quarter), midY);
        }
        
        ctx.stroke();
        
        ctx.closePath();
    }
    
    static colors: string[] = ["red", "blue", "yellow", "green", "white", "purple", "orange", "aqua"];
    static chosenColor: string = WalkieTalkie.colors[Math.floor(Math.random()*WalkieTalkie.colors.length)];
    static frameRate: number = 10;
    static frameKeep: number = 0;
    loop(ctx: CanvasRenderingContext2D): Promise<any> {
        return new Promise((resolve, reject) => {
            this.paint(ctx);
            if(WalkieTalkie.frameKeep > WalkieTalkie.frameRate) {
                ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
                WalkieTalkie.frameKeep = 0;
            }
            WalkieTalkie.chosenColor = WalkieTalkie.colors[Math.floor(Math.random()*WalkieTalkie.colors.length)];
            WalkieTalkie.frameKeep++;
            resolve(true);
        });
    }

    reset(): void {
        // throw new Error("Method not implemented.");
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

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

        // gap is a y axis (up/down) gap based on y mouse position
        const gap = (this.isMobile) ? 0 : 100 - (this.mousePos[1] * .1);

        // space is an x axis (left/right) space based on x mouse position
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

        const canvasWidth = ctx.canvas.width;
        const quarter = ctx.canvas.width * (1 / (this.size * 2));
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
            ctx.moveTo(base, midY);
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
    
    static frameRate: number = 10;
    static frameKeep: number = 0;
    
    static colors: string[] = ["red", "blue", "yellow", "green", "white", "purple", "orange", "aqua", "crimson", "cyan", "chocolate", "DarkSalmon", "ForestGreen", "Gainsboro", "LavenderBlush", "LemonChiffon", "LightSkyBlue", "MidnightBlue", "Silver", "SeaGreen", "Sienna", "SlateBlue", "Gold", "Khaki", "DarkOrange", "Aquamarine"];
    static sectionColors: string[] = WalkieTalkie.colorArrayRandom(4, WalkieTalkie.colors);
    static chosenColor: string = WalkieTalkie.colors[Math.floor(Math.random()*WalkieTalkie.colors.length)];
    static sectionCount: number = 0;

    loop(ctx: CanvasRenderingContext2D): Promise<any> {
        return new Promise((resolve) => {
            // Every section we set four new random colors
            if(WalkieTalkie.sectionCount !== Time.sectionIndex) {
                // Filter is used to have them be different colors
                WalkieTalkie.sectionColors = WalkieTalkie.colorArrayRandom(4, WalkieTalkie.colors.filter((el) => {
                    return !WalkieTalkie.sectionColors.includes(el);
                }));
                WalkieTalkie.sectionCount = Time.sectionIndex;
            }
            
            // Use d3 to get an interpolated color
            WalkieTalkie.chosenColor = this.d3Color(WalkieTalkie.sectionColors);

            // Paint the scene and clear the frame according to the framerate
            this.paint(ctx);
            WalkieTalkie.frameKeep++;
            if(WalkieTalkie.frameKeep > WalkieTalkie.frameRate) {
                ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
                WalkieTalkie.frameKeep = 0;
            }
            resolve(true);
        });
    }

    reset(): void {
        WalkieTalkie.frameKeep = 0;
        WalkieTalkie.sectionCount = 0;
        WalkieTalkie.sectionColors = WalkieTalkie.colorArrayRandom(4, WalkieTalkie.colors);
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

    /**
     * Returns a new unique array of random colors given a size
     * @param size the size of the returned array
     * @returns a unique colors array of given size
     */
    static colorArrayRandom(size: number, check: Array<string>): Array<string> {
        let colors: string[] = [];

        while(colors.length < size) {
            let random = Math.floor(Math.random()*check.length);
            const color = check[random];
            if(colors.indexOf(color) === -1) {
                colors.push(color);
            }
        }

        return colors;
    }

    /**
     * Uses d3.piecewise to return an interpolated color from a given array of colors
     * @param colors array of colors
     * @returns interpolated color
     */
    d3Color(colors: string[]): string {
        const difference = Math.abs(this.roundPos(this.position) - this.beat.start);
        const colorD3 = d3.piecewise(d3.interpolateRgb.gamma(2.2), colors);
        return colorD3(difference / this.beat.duration);
    }
}

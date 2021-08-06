import * as d3 from 'd3-interpolate';
import { Sketch } from "../../sketch.model";
import { Time } from "../../time.model";
import { Analysis, Features, Segment } from "../../track.model";

class Drop {
    x: number;
    y: number;
    size: number;
    color: string;
    constructor(x: number, y: number, size: number, color: string) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
    }
}

export class AcidRain extends Time implements Sketch {
    name: string = "☔ Acid Rain ☔";
    creator: string = "Captain Brando!";
    offset: number = 0;
    features: Features;
    constructor(position: number, analysis: Analysis, features: Features) {
        super(position, analysis);
        this.features = features;
    }

    static allDrops: Drop[] = [];
    static segmentCount: number = 0;
    static allColors: string[] = ["red", "blue", "yellow", "green", "white", "purple", "orange", "aqua", "crimson", "cyan", "chocolate", "DarkSalmon", "ForestGreen", "Gainsboro", "LavenderBlush", "LemonChiffon", "LightSkyBlue", "MidnightBlue", "Silver", "SeaGreen", "Sienna", "SlateBlue", "Gold", "Khaki", "DarkOrange", "Aquamarine"];

    paint(ctx: CanvasRenderingContext2D): void {
        let dropsToRemove: Drop[] = [];
        ctx.lineWidth = AcidRain.lineWidth;
        
        AcidRain.allDrops.map((drop: Drop) => {
            if(drop.y > ctx.canvas.height) {
                dropsToRemove.push(drop);
                this.paintBlack(ctx, drop);
            }
            else {
                this.paintBlack(ctx, drop);
                const speed = Math.ceil(this.features.danceability * 10);
                drop.y += speed;
                ctx.beginPath();
                ctx.strokeStyle = drop.color;
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x, drop.y + drop.size);
                ctx.stroke();
                ctx.closePath();
            }
        });

        AcidRain.allDrops = AcidRain.allDrops.filter((el) => {
            return !dropsToRemove.includes(el);
        });
    }

    paintBlack(ctx: CanvasRenderingContext2D, drop: Drop): void {
        ctx.beginPath();
        ctx.lineWidth = AcidRain.lineWidth + 2;
        ctx.strokeStyle = "black";
        ctx.moveTo(drop.x, drop.y - 20);
        ctx.lineTo(drop.x, drop.y + drop.size + 10);
        ctx.stroke();
        ctx.closePath();
        ctx.lineWidth = AcidRain.lineWidth;
    }

    makeDrop(width: number): Drop {
        const dropX = this.getRandomX(width);
        const dropSize = this.getLoudness(this.position, this.segment);
        const color = this.getRandomColor();
        return new Drop(dropX, 0 - dropSize, dropSize, color);
    }

    static ctx: CanvasRenderingContext2D;
    static lineWidth: number = 7;

    loop(ctx: CanvasRenderingContext2D): Promise<any> {
        if(!AcidRain.ctx) AcidRain.ctx = ctx;
        return new Promise((resolve) => {
            if(Time.segmentIndex !== AcidRain.segmentCount) {
                AcidRain.allDrops.push(this.makeDrop(ctx.canvas.width));
                AcidRain.segmentCount = Time.segmentIndex;
            }
            this.paint(ctx);
            resolve(true);
        });
    }

    reset(): void {
        AcidRain.segmentCount = 0;
        AcidRain.allDrops = [];
        if(AcidRain.ctx) AcidRain.ctx.clearRect(0, 0, AcidRain.ctx.canvas.clientWidth, AcidRain.ctx.canvas.clientHeight);
    }

    /**
     * Returns a x-pos based on most prevalent pitch of segment and key of section,
     * such that in the key of C (or 0), a pitch of E (or 4) 
     * will return 4/12 (1/3) of the canvas width plus the decimal of the pitch value 
     * or minus it if the decimal value is < .5
     * 
     * @param width canvas width
     * @returns xPos 0-width inclusive value representative of pitch to key
     */
    getRandomX(width: number): number {
        return Math.floor(Math.random() * (width + 1));
    }

    /**
     * Returns a random color from the allColors array
     * @param check array of available colors
     */
    getRandomColor(): string {
        return AcidRain.allColors[Math.floor(Math.random()*AcidRain.allColors.length)];
    }

    getGradient(drop: Drop): string {
        const d3Black = d3.interpolateLab(drop.color, "black");
        return "";
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
        let loudness_d3 = d3.interpolateNumber(segment.loudnessEnd, segment.loudnessStart);
        return Math.abs(loudness_d3(difference / segment.measure.duration));
    }
}
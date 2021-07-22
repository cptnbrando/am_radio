import * as d3 from 'd3-interpolate';
import { Analysis, Bar, Beat, Section, Segment, Tatum } from "./track.model";

/**
 * A sketch, or a single frame of a visual representation of given audio data
 */
export class Sketch {
    public position: number;
    public analysis: Analysis;
    private beat!: Beat;
    public beatIndex: number = 0;
    private bar!: Bar;
    private barIndex: number = 0;
    private section!: Section;
    private sectionIndex: number = 0;
    private segment!: Segment;
    private segmentIndex: number = 0;
    private tatum!: Tatum;
    private tatumIndex: number = 0;

    constructor(position: number, analysis: Analysis) {
        this.position = position; 
        this.analysis = analysis;
        // this.beat = this.find(analysis.beats, position);
        // this.bar = this.find(analysis.bars, position);
        // this.tatum = this.find(analysis.tatums, position);
        // this.section = this.find(analysis.sections, position);
        // this.segment = this.find(analysis.segments, position);
    }

    setValues(analysis: Analysis, position: number): any {
        return new Promise((resolve) => {
            this.position = position;
            this.find(analysis.beats, position).then(data => {
                this.beat = data;
            });

            this.find(analysis.bars, position).then(data => {
                this.bar = data;
            });

            // this.bar = this.find(analysis.bars, position);
            // this.tatum = this.find(analysis.tatums, position);
            // this.section = this.find(analysis.sections, position);
            // this.segment = this.find(analysis.segments, position);
            resolve(true);
        });
    }

    paint(ctx: CanvasRenderingContext2D, position: number): void {
        ctx.beginPath();
        ctx.strokeStyle = "white";
        ctx.fillStyle = "white";
        ctx.lineWidth = 6;
        let circleX = ctx.canvas.width / 2;
        let circleY = ctx.canvas.height / 2;
        let radius = Math.abs(this.getBeatConfidence(position) * 1000);
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
    getBeatConfidence(position: number): number {
        // Confidence is always between 0 and 1
        const confidence_d3 = d3.interpolateNumber(.1, this.beat.confidence);
        let difference = parseFloat((position / 1000).toFixed(3)) - this.beat.start;
        return confidence_d3(difference / this.beat.duration);
    }

    /**
     * Find which beat / bar / tatum we are at given a current position and an array of beats/bars/tatums
     * @param patterns Array of track analysis objects
     * @param position The current position
     * @returns Promise for a found beat / bar / tatum
     */
    find(patterns: Array<Beat | Bar | Tatum>, position: number, start?: number): Promise<Beat | Bar | Tatum>  {
        return new Promise((resolve) => {
            let roundedPos: number = parseFloat((position / 1000).toFixed(3));
            let count = (start) ? start : 0;
            // MASSIVE SHOUTOUT TO THIS ON GOD https://stackoverflow.com/questions/8584902/get-the-closest-number-out-of-an-array
            // also this https://stackoverflow.com/questions/36144406/how-to-early-break-reduce-method
            let robertPATTERNson = patterns.slice(count).reduce((lastPattern, currentPattern, index, arrayCopy) => {
                return (Math.abs(currentPattern.start - roundedPos) < Math.abs(lastPattern.start - roundedPos) ? currentPattern : lastPattern);
            });

            resolve(robertPATTERNson);
        });
    }

    /**
     * Whether or not the given object is of type Segment / Section
     * @param data object to verify type
     * @returns true if it's a Section / Segment, false if not
     */
    isSectionOrSegment(data: any): data is Section | Segment {
        if((data as Section).measure || (data as Segment).measure) {
            return true;
        }
        return false;
    }
}

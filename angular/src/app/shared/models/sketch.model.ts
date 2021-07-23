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
    public barIndex: number = 0;
    private section!: Section;
    public sectionIndex: number = 0;
    private segment!: Segment;
    public segmentIndex: number = 0;
    private tatum!: Tatum;
    public tatumIndex: number = 0;

    constructor(position: number, analysis: Analysis) {
        this.position = position; 
        this.analysis = analysis;
    }

    /**
     * Parse through the analysis array and find which beat/bar/section/segment/tatum we are given a position
     * @param indexArray [beatIndex, barIndex, sectionIndex, segmentIndex, tatumIndex] for faster array parsing
     * @returns promise that resolves when all values are
     */
    setValues(indexArray: Array<number>, sectionMeasures: Array<Bar>, segmentMeasures: Array<Bar>): any {
        return new Promise((resolve) => {
            // Find the beat
            this.find(this.analysis.beats, indexArray[0]).then(data => {
                this.beat = data[0];
                this.beatIndex = data[1];
            });
            // Find the bar
            this.find(this.analysis.bars, indexArray[1]).then(data => {
                this.bar = data[0];
                this.barIndex = data[1];
            });
            // Find the tatum
            this.find(this.analysis.tatums, indexArray[4]).then(data => {
                this.tatum = data[0];
                this.tatumIndex = data[1];
            });
            // Find the section
            this.find(sectionMeasures, indexArray[2]).then(data => {
                this.sectionIndex = data[1];
                this.section = this.analysis.sections[data[1]];
            });
            // Find the segment
            this.find(segmentMeasures, indexArray[2]).then(data => {
                this.segmentIndex = data[1];
                this.segment = this.analysis.segments[data[1]];
            });

            // this.bar = this.find(analysis.bars, position);
            // this.tatum = this.find(analysis.tatums, position);
            // this.section = this.find(analysis.sections, position);
            // this.segment = this.find(analysis.segments, position);
            resolve(true);
        });
    }

    /**
     * Paint our sketch, takes a position to be more accurate
     * @param ctx context to draw with
     * @param position the current position
     */
    paint(ctx: CanvasRenderingContext2D, position: number): void {
        ctx.beginPath();
        ctx.strokeStyle = "white";
        ctx.fillStyle = "white";
        ctx.lineWidth = 6;
        let circleX = ctx.canvas.width / 2;
        let circleY = ctx.canvas.height / 2;
        let confidence = this.getConfidence(position, this.beat);
        let radius = Math.abs(confidence * 750);
        ctx.arc(circleX, circleY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();

        // ctx.beginPath();
        // ctx.strokeStyle = "yellow";
        // ctx.fillStyle = "yellow";
        // ctx.lineWidth = 2;
        // ctx.rect(this.getConfidence(position, this.bar) * 500, 100, 10, this.getConfidence(position, this.bar) * 100);
        // ctx.stroke();
        // ctx.closePath();
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

    /**
     * Find which beat / bar / tatum we are at given a current position and an array of beats/bars/tatums
     * @param patterns Array of track analysis objects
     * @param position The current position
     * @returns Promise for a found beat / bar / tatum
     */
    find(patterns: Array<Beat | Bar | Tatum>, start?: number): Promise<[(Beat | Bar | Tatum), number]>  {
        return new Promise((resolve) => {
            let roundedPos: number = parseFloat((this.position / 1000).toFixed(3));
            let count = (start) ? start : 0;
            let foundIndex = 0;
            // MASSIVE SHOUTOUT TO THIS ON GOD https://stackoverflow.com/questions/8584902/get-the-closest-number-out-of-an-array
            // also this https://stackoverflow.com/questions/36144406/how-to-early-break-reduce-method
            let robertPATTERNson = patterns.slice(count).reduce((lastPattern, currentPattern, index, arrayCopy) => {
                // Shortcut! If we're past the position, exit out because we've found our value
                if(currentPattern.start > roundedPos) {
                    foundIndex = index - 1;
                    arrayCopy.splice(0);
                    return lastPattern;
                }
                return (Math.abs(currentPattern.start - roundedPos) < Math.abs(lastPattern.start - roundedPos) ? currentPattern : lastPattern);
            });

            // We return the pattern found and it's index in the array
            resolve([robertPATTERNson, foundIndex]);
        });
    }
}

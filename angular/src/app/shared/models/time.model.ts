import { Sketch } from "./sketch.model";
import { Beat, Bar, Section, Segment, Tatum, Analysis } from "./track.model";

/**
 * Houses all the calculations for a given Sketch
 */
export class Time {
    // The position in ms
    public position: number;
    public analysis: Analysis;

    // All audio data that can be used in Sketch
    protected beat!: Beat;
    public beatIndex: number = 0;
    protected bar!: Bar;
    public barIndex: number = 0;
    protected section!: Section;
    public sectionIndex: number = 0;
    protected segment!: Segment;
    public segmentIndex: number = 0;
    protected tatum!: Tatum;
    public tatumIndex: number = 0;

    constructor(position: number, analysis: Analysis) {
        this.position = position; 
        this.analysis = analysis;
    }

    /**
     * Parse through the analysis array and find which beat/bar/section/segment/tatum we are given a position
     * @param indexArray [beatIndex, barIndex, sectionIndex, segmentIndex, tatumIndex] for faster array parsing
     * @param sectionMeasures array of all measures of the sections, stored once per track when parsing analysis data
     * @param segmentMeasures array of all measures of the segments, stored once per track when parsing analysis data
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
            
            resolve(true);
        });
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

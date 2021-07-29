import * as d3Array from 'd3-array';
import { Beat, Bar, Section, Segment, Tatum, Analysis } from "./track.model";

/**
 * Houses all the calculations for a given Sketch
 */
export class Time {
    // The position in ms
    public position: number;
    public analysis: Analysis;
    // public features: Features;

    // All audio data that can be used in Sketch
    public beat!: Beat;
    public static lastBeat: Beat;
    public static beatIndex: number = 0;
    public bar!: Bar;
    public static lastBar: Beat;
    public static barIndex: number = 0;
    public section!: Section;
    public static lastSection: Section;
    public static sectionIndex: number = 0;
    public segment!: Segment;
    public static lastSegment: Segment;
    public static segmentIndex: number = 0;
    public tatum!: Tatum;
    public static lastTatum: Tatum;
    public static tatumIndex: number = 0;

    public static beatConfAvg: number = 0.4;

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
    public setValues(position: number, sectionMeasures: Array<Bar>, segmentMeasures: Array<Bar>): Promise<any> {

        this.position = position;

        // Find the beat
        const beatPromise = 
            this.find(this.analysis.beats, position).then(data => {
                this.beat = data[0];
                Time.lastBeat = data[0];
                Time.beatIndex = data[1];
            });
        // Find the bar
        // console.log("bar");
        const barPromise = 
            this.find(this.analysis.bars, position).then(data => {
                this.bar = data[0];
                Time.lastBar = data[0];
                Time.barIndex = data[1];
            });
        // Find the section
        // console.log("section");
        const sectionPromise =
            this.find(sectionMeasures, position).then(data => {
                this.section = this.analysis.sections[data[1]];
                Time.lastSection = this.analysis.sections[data[1]];
                Time.sectionIndex = data[1];
            });
        // Find the segment
        const segmentPromise =
            this.find(segmentMeasures, position).then(data => {
                this.segment = this.analysis.segments[data[1]];
                Time.lastSegment = this.analysis.segments[data[1]];
                Time.segmentIndex = data[1];
            });
        // Find the tatum
        const tatumPromise =
            this.find(this.analysis.tatums, position).then(data => {
                this.tatum = data[0];
                Time.lastTatum = data[0];
                Time.tatumIndex = data[1];
            });

        // Resolve when all of them complete
        return Promise.allSettled([beatPromise, barPromise, sectionPromise, segmentPromise, tatumPromise]);
    }

    /**
     * Find which beat / bar / tatum we are at given a current position and an array of beats/bars/tatums
     * @param patterns Array of track analysis objects
     * @param position The current position
     * @returns Promise for a found beat / bar / tatum
     */
    private find(patterns: Array<Beat | Bar | Tatum>, position: number, start?: number): Promise<[(Beat | Bar | Tatum), number]>  {
        return new Promise((resolve) => {
            let roundedPos = this.roundPos(position);
            let starts: Array<number> = [];

            patterns.map((data: Beat | Bar | Tatum) => {
                starts.push(data.start);
            });

            let index = d3Array.bisectLeft(starts, roundedPos, start);
            resolve([patterns[index], index]);
        });
    }

    protected roundPos(pos: number): number {
        return parseFloat((pos / 1000).toFixed(3));
    }

    public static resetTime(): void {
        Time.beatIndex = 0;
        Time.barIndex = 0;
        Time.segmentIndex = 0;
        Time.sectionIndex = 0;
        Time.tatumIndex = 0;
    }
}

/**
 * An Analysis object for a track from Spotify
 */
export interface Analysis {
    bars: Array<Bar>;
    beats: Array<Beat>;
    meta: Meta;
    sections: Array<Section>;
    segments: Array<Segment>;
    tatums: Array<Tatum>;
    track: any;
}

/**
 * A Features object for a track from Spotify
 */
export interface Features {
    acousticness: number;
    analysisUrl: string;
    danceability: number;
    durationMs: number;
    energy: number;
    id: string;
    instrumentalness: string;
    key: number;
    liveness: number;
    loudness: number;
    mode: string;
    speechiness: number;
    tempo: number;
    timeSignature: number;
    trackHref: string;
    type: string;
    uri: string;
    valence: number;
}

/**
 * A beat. You know, like, untz untz etc.
 * 
 * confidence: 0.604
 * duration: 0.603
 * start: 64.265
 */
export interface Beat {
    confidence: number;
    duration: number;
    start: number;
}

/**
 * A bar, basically a longer beat
 * 
 * confidence: 0.41
 * duration: 2.587
 * ​​start: 4.405
 */
export interface Bar {
    confidence: number;
    duration: number;
    start: number;
}

/**
 * A section, like multiple bars combined
 * Longest values
 * 
 * key: 11
 * keyConfidence: 0.045
 * ​​loudness: -7.686
 * ​​measure: Object { confidence: 1, duration: 17.036, start: 10.152 }​
 * mode: null
 * ​​modeConfidence: 0.204
 * ​​tempo: 95.496
 * ​​tempoConfidence: 0.623
 * ​timeSignature: 4
 * ​​timeSignatureConfidence: 1
 */
export interface Section {
    key: number;
    keyConfidence: number;
    loudness: number;
    measure: Bar;
    mode: any;
    modeConfidence: number;
    tempo: number;
    tempoConfidence: number;
    timeSignature: number;
    timeSignatureConfidence: number;
}

/**
 * Like short beats, idk why you call these segments.
 * I feel like a segment should be something long, ah well.
 * 
 * loudnessEnd: -17.906
 * ​​​loudnessMax: -9.97
 * ​​​loudnessMaxTime: 0.013
 * ​​​loudnessStart: -13.785
 * ​​​measure: Object { confidence: 0.068, duration: 0.133, start: 0.493 }
 * ​​​pitches: Array(12) [ 0.327, 0.671, 0.677, … ] i think this is always 12 values...
 * ​​​timbre: Array(12) [ 47.653, 131.639, 86.263, … ] i think this is always 12 values...
 */
export interface Segment {
    loudnessEnd: number;
    loudnessMax: number;
    loudnessMaxTime: number;
    loudnessStart: number;
    measure: Bar;
    pitches: Array<number>;
    timbre: Array<number>;
}

/**
 * It's like a sixteenth note
 * 
 * confidence: 0.91
 * ​​duration: 0.32
 * ​​​start: 32.603
 */
export interface Tatum {
    confidence: number;
    duration: number;
    start: number;
}

/**
 * Metadata, unused mostly, probably
 * 
 * analysisTime: 12.46434
 * ​analyzerVersion: "4.0.0"
 * ​detailedStatus: "OK"
 * ​inputProcess: "libvorbisfile L+R 44100->22050"
 * platform: "Linux"
 * statusCode: 0
 * timestamp: 1623813462
 */
export interface Meta {
    analysisTime: number;
    analyzerVersion: string;
    detailedStatus: string;
    inputProcess: string;
    platform: string;
    statusCode: number;
    timestamp: number;
}
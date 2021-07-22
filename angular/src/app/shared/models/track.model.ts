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
 * A beat. You know, like, untz untz etc.
 */
export interface Beat {
    confidence: number;
    duration: number;
    start: number;
}

/**
 * A bar, basically a longer beat
 */
export interface Bar {
    confidence: number;
    duration: number;
    start: number;
}

/**
 * A section, like multiple bars combined
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
 * wtf is a tatum??
 */
export interface Tatum {
    confidence: number;
    duration: number;
    start: number;
}

/**
 * Metadata, unused mostly, probably
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
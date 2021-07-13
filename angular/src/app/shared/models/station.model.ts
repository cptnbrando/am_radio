/**
 * Class for Station objects that should exactly copy the server side Station model 
 */
export class Station
{
    // ID of the Station, aka the Station number or channel
    stationID: number;

    // Date of Station creation
    stationCreated: Date;

    // Name of the Station, should be set to the Spotify Playlist initially
    stationName: string;

    // Optional info for the Station
    stationInfo: string;

    // Spotify ID for the creator's User Account
    creatorID: string;

    // Spotify URI for the Playlist linked to this Station
    playlistID: string;

    // When the last track began playback
    playTime: number;

    // The currently playing track URI
    currentURI: string;

    // The next track URI
    nextURI: string;

    // Whether the station is playing or not
    isPlaying: boolean;

    //// OBJECTS - all from SpotifyAPI

    // The creator of the playlist, User object
    creator: any;

    // The playlist, PlaylistSimplified object
    playlist: any;

    // All the track objects of the playlist, List<PlaylistTrack>
    allTracks: any;

    // All the track objects that haven't been played yet, List<PlaylistTrack>
    notPlayedTracks: any;

    // The currently playing track, IPlaylistItem
    current: any;

    // The next track, IPlaylistItem
    next: any;

    // All of the currently listening Users, HashMap<String, User>
    listeners: any;

    constructor(stationID?: number) {
        this.stationID = 0;
        this.stationCreated = new Date();
        this.stationName = "Recently Played";
        this.stationInfo = "A random playlist from the last 25 that you've last played from your Spotify library";
        this.creatorID = "";
        this.playlistID = "";
        this.playTime = 0;
        this.currentURI = "";
        this.nextURI = "";
        this.isPlaying = false;
        this.creator = {};
        this.creator.displayName = "You";
        this.playlist = {};
        this.allTracks = {};
        this.notPlayedTracks = {};
        this.current = {};
        this.next = {};
        this.listeners = {};

        if(stationID) {
            this.stationID = stationID;
            this.stationName = "No Station";
            this.stationInfo = "This station is available";
        }
    }
}

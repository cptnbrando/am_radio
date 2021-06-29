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

    // The currently playing track
    current: string;

    // The next track
    next: string;

    constructor(stationID?: number)
    {
        this.stationID = 0;
        this.stationCreated = new Date();
        this.stationName = "Recently Played";
        this.stationInfo = "A random playlist from the last 25 that you've last played from your Spotify library";
        this.creatorID = "";
        this.playlistID = "";
        this.playTime = 0;
        this.current = "";
        this.next = "";
        if(stationID)
        {
            this.stationID = stationID;
            this.stationName = "No Station";
            this.stationInfo = "This station is available";
        }
    }
}

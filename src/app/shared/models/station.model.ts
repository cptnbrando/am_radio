/**
 * Interface for Station objects that should exactly copy the server side Station model 
 */
export interface Station 
{
    // ID of the Station, aka the Station number or channel
    'stationID': number;

    // Date of Station creation
    'stationCreated': Date;

    // Name of the Station, should be set to the Spotify Playlist initially
    'stationName': string;

    // Optional info for the Station
    'stationInfo': string;

    // Spotify ID for the creator's User Account
    'creatorID': string;

    // Spotify URI for the Playlist linked to this Station
    'playlist': string;

    // When the last track began playback
    'playTime': number;

    // The currently playing track
    'current': string;

    // The next track
    'next': string;
}

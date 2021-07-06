package com.example.AMRadioServer.model;

import com.wrapper.spotify.model_objects.IPlaylistItem;
import com.wrapper.spotify.model_objects.specification.PlaylistSimplified;
import com.wrapper.spotify.model_objects.specification.PlaylistTrack;
import com.wrapper.spotify.model_objects.specification.User;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.annotation.CreatedDate;

import javax.persistence.*;
import java.util.*;

/**
 * Model for a Station
 * Holds id info + the current track, the next track, and when the current track began (playTime)
 * Uses transients to hold object info but stores URI and String id fields
 */
@Entity
@Data
@NoArgsConstructor
@Table(name = "Stations")
public class Station
{
    /**
     * ID of the station
     * 000 - 999 currently
     */
    @Id
    @Column(name = "station_id")
    private int stationID;

    /**
     * The date the station was created
     * NOT the time it started playing
     */
    @CreatedDate
    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "station_created")
    private Date stationCreated;

    /**
     * Name of Station, should be set to the Spotify Playlist name initially
     */
    @Column(name = "station_name", nullable = false)
    private String stationName;

    /**
     * Optional bio of the Station
     */
    @Column(name = "station_info")
    private String stationInfo;

    /**
     * ID of Spotify User Account
     */
    @Column(name = "creator_id", nullable = false)
    private String creatorID;

    /**
     * ID of Spotify playlist
     * Only one Station can exist for a Playlist
     */
    @Column(name = "playlist_id", nullable = false, unique = true)
    private String playlistID;

    /**
     * This is the precise time the song began playback, in milliseconds long format
     * It gets set everytime a new track begins, which happens when the current time is greater than this value + current track length
     *
     * Basically we'll look at this value, compare how long it's been since, and bam! we know where to begin playback!
     */
    @Column(name = "play_time")
    private long playTime;

    /**
     * Spotify URI of the currently playing track
     */
    @Column(name = "current_uri")
    private String currentURI;

    /**
     * Spotify URI of the next track to play
     */
    @Column(name = "next_uri")
    private String nextURI;

    /**
     * Boolean to specify whether the station is currently playing or not
     * False by default
     */
    @Column(name = "isPlaying", nullable = false)
    private boolean isPlaying;

    /**
     * Spotify User object
     * Cannot be stored in db, must be filled in via spotifyApi and id on load
     * Stored in HashMap value
     */
    @Transient
    private User creator;

    /**
     * Spotify PlaylistSimplified object
     * Cannot be stored in db, must be filled in via spotifyApi and id on load
     * Stored in HashMap value
     */
    @Transient
    private PlaylistSimplified playlist;

    /**
     * ArrayList of tracks, updated whenever a station gets a new song to ensure no repeated track plays
     * Cannot be stored in db, must be filled via spotifyApi and id on load
     * Stored in HashMap value
     */
    @Transient
    private List<PlaylistTrack> allTracks;

    /**
     * I can't use the SpotifyAPI here, so we have another list and remove tracks as they get played
     */
    @Transient
    private List<PlaylistTrack> notPlayedTracks;

    /**
     * This should point to the currently playing song
     * Cannot be stored in db, must be filled in via spotifyApi and id on load
     * Stored in HashMap value
     */
    @Transient
    private IPlaylistItem current;

    /**
     * This should point to the next song to play
     * Cannot be stored in db, must be filled in via spotifyApi and id on load
     * Stored in HashMap value
     */
    @Transient
    private IPlaylistItem next;

    /**
     * Holds all current station listeners
     * Spotify userID : Spotify User object
     * Cannot be stored in db, must be filled in via spotifyApi and id on load
     * Stored in HashMap value
     */
    @Transient
    private HashMap<String, User> listeners;

    /**
     * Constructor for new Stations with default values
     *
     * @param stationID 000 - 999 radio station ID (Required in case a station is being overwritten)
     * @param playlist Spotify PlaylistSimplified object
     * @param tracks List of Spotify PlaylistTrack objects (Not stored in PlaylistSimplified, must be gotten separately)
     */
    public Station(int stationID, PlaylistSimplified playlist, List<PlaylistTrack> tracks) {
        this.stationID = stationID;
        this.stationName = playlist.getName();
        this.stationInfo = null;
        this.creatorID = playlist.getOwner().getId();
        this.playlistID = playlist.getId();

        this.playTime = 0;
        this.currentURI = null;
        this.nextURI = null;
        this.isPlaying = false;

        // Transients
        this.creator = playlist.getOwner();
        this.playlist = playlist;
        this.allTracks = tracks;
        this.notPlayedTracks = new ArrayList<>(tracks);
        this.current = null;
        this.next = null;
        this.listeners = new HashMap<>();
    }

    /**
     * Setter for current playing track, required to also set the currentURI field
     * @param current a current IPlaylistItem track
     */
    public void setCurrent(IPlaylistItem current) {
        this.current = current;
        if(current != null) this.currentURI = current.getUri();
        else this.currentURI = null;
    }

    /**
     * Setter for next track to play, required to also set the nextURI field
     * @param next a next IPlaylistItem track
     */
    public void setNext(IPlaylistItem next) {
        this.next = next;
        if(next != null) this.nextURI = next.getUri();
        else this.nextURI = null;
    }

    /**
     * Change the current to the next and get a new random next track
     * Updates the track fields and set the playTime to the current time
     */
    public void update() {
        // Refresh the tracks list if it is empty
        if(this.getNotPlayedTracks().isEmpty())
        {
            List<PlaylistTrack> trackList = this.allTracks;
            Collections.shuffle(trackList);
            this.setNotPlayedTracks(trackList);
        }

//        System.out.println("In update()");
//        System.out.println(this.getNotPlayedTracks().size());

        // If next is null, then we get a new random track
        if(this.next == null) {
            // Set a random next track and remove it from the list to avoid repeated tracks
            int rnd = new Random().nextInt(this.getNotPlayedTracks().size());
            this.setNext(this.getNotPlayedTracks().remove(rnd).getTrack());
        }

        // Current to next
        this.setCurrent(this.getNext());

        // Set a random next track and remove it from the list to avoid repeated tracks
        int rnd = new Random().nextInt(this.getNotPlayedTracks().size());
        this.setNext(this.getNotPlayedTracks().remove(rnd).getTrack());

        // Set new playTime
        this.setPlayTime(System.currentTimeMillis());
    }

    /**
     * Set all the track values to null and set isPlaying to false
     */
    public void stop() {
        this.setPlaying(false);
        this.setListeners(new HashMap<>());
        this.setNotPlayedTracks(new ArrayList<>(this.allTracks));
        this.setCurrent(null);
        this.setNext(null);
        this.setPlayTime(0);
    }
}

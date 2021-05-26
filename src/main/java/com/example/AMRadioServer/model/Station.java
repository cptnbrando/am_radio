package com.example.AMRadioServer.model;

import com.wrapper.spotify.model_objects.specification.User;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.annotation.CreatedDate;

import javax.persistence.*;
import java.util.Date;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@Table(name = "Stations")
public class Station
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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
     * Short optional bio of the Station
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
    @Column(name = "playlist", nullable = false, unique = true)
    private String playlist;

    /**
     * This is the precise time the song began playback
     * We want it in ms because then we can calculate where to play the song at
     *
     * Basically we'll look at this value, compare how long it's been since, and bam! we know where to begin playback!
     * It will get updated every time a new track begins
     */
//    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "play_time")
    private Date playTime;

    /**
     * This should point to the currently playing song
     * It will need a Spotify URI
     */
    @Column(name = "current")
    private String current;

    /**
     * This should point to the next song to play
     * It will need a Spotify URI
     */
    @Column(name = "next")
    private String next;

//    private List<User> listeners;

    /**
     * This constructor is for new Stations, with most of the fields missing
     *
     * Either this or the controller should initialize the fields based on the Spotify api
     */
    public Station(String stationName, String playlist) {
        this.stationName = stationName;
        this.playlist = playlist;
    }
}

package com.example.AMRadioServer.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.wrapper.spotify.model_objects.specification.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.util.Date;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
@Table(name = "Stations")
public class Station
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "station_id")
    private int stationID;

    // This is the date the station was created
    // idk if we need it in ms... ah crap maybe...
    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "MM-dd-yyyy HH:mm:ss")
    @Column(name = "station_created")
    private Date stationCreated;

    // Nullable because if it's null, then the playlist title in the spotify url should be used
    @Column(name = "station_name")
    private String stationName;

    // The URI of the Spotify Account that created this station
    @Column(name = "station_creator")
    private String stationCreator;

    @Column(name = "station_url", nullable = false)
    private String stationURL;

    @Column(name = "station_info")
    private String stationInfo;

    /**
     *      This is when the current song began
     *      The idea is that anybody logging onto the station can use this, add the time it's been since this
     *      and play the current song from that difference!
     *
     *      But with time zones, this falls apart...
     *      UTC? Universal Time Zone?
     *      ...
     *      Looks like all Java.Util.Date are by default universal by how they work
     *      So it should work... ah maybe lol
     *      Maybe if the client and server are synchronized with the same world clock...?
     */

    // This is the precise time the song began playback
    // We want it in ms because then we can calculate where to play the song at
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "play_time")
    private Date playTime;

    // This should point to the current playing song
    @Column(name = "current")
    private String current;

    // This should point to the next song to play
    @Column(name = "next")
    private String next;

    // This is the creator of the station, linked via their spotify account URI
    @Column(name = "creator")
    private String creatorURI;

    /**
     * This constructor is for new Stations, with most of the fields missing
     *
     * Either this or the controller should initialize the fields based on the Spotify api
     */
    public Station(String stationName, String stationURL) {
        this.stationName = stationName;
        this.stationURL = stationURL;
    }
}

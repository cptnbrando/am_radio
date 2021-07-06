package com.example.AMRadioServer.service;

import com.example.AMRadioServer.model.ResponseMessage;
import com.example.AMRadioServer.model.Station;
import com.example.AMRadioServer.repository.StationRepository;
import com.wrapper.spotify.SpotifyApi;
import com.wrapper.spotify.exceptions.SpotifyWebApiException;
import com.wrapper.spotify.model_objects.specification.Playlist;
import com.wrapper.spotify.model_objects.specification.PlaylistSimplified;
import com.wrapper.spotify.model_objects.specification.PlaylistTrack;
import com.wrapper.spotify.model_objects.specification.User;
import lombok.Data;
import org.apache.hc.core5.http.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * This service class controls the Station
 * Returns ResponseMessage to give info back to the controller
 *
 * - createStation
 * - getCurrent
 * - getNext
 * - setCurrent
 * - setNext
 * - next
 */
@Service("StationService")
@Data
public class StationService {
    private StationRepository stationRepo;

    // HashMap stationNumber:Station
    // This will hold object fields that can't be stored in the db
    private HashMap<Integer, Station> allStations;

    // HashMap stationNumber: RadioThread
    // Holds all threads for each station
    private HashMap<Integer, Thread> allRadioThreads;

    private HashMap<Integer, ExecutorService> allRadioExecutors;

    private final SpotifyApi spotifyApi;

    @Autowired
    public StationService(StationRepository stationRepo, SpotifyApi spotifyApi) {
        this.stationRepo = stationRepo;
        this.spotifyApi = spotifyApi;
        this.allStations = new HashMap<>();
        this.allRadioThreads = new HashMap<>();

        // Initialize with all currently created Stations from db
        List<Station> all = this.stationRepo.findAll();
        for(Station station: all) {
            allStations.put(station.getStationID(), station);
        }
    }

    /**
     * SpotifyAPI needs a session, so the first user to access it can fill it with theirs
     * Also saves it to the db
     * @param station - Station to fill
     */
    private Station fillStationData(Station station) {
        try {
            if(station.getAllTracks() == null) {
                PlaylistTrack[] tracks = this.spotifyApi.getPlaylist(station.getPlaylistID()).build().execute().getTracks().getItems();
                station.setAllTracks(Arrays.asList(tracks));
                station.setNotPlayedTracks(new ArrayList<>(Arrays.asList(tracks)));
            }
            if(station.getCreator() == null) {
                station.setCreator(this.spotifyApi.getUsersProfile(station.getCreatorID()).build().execute());
            }
            this.saveStation(station);
            return station;
        } catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Spotify exception caught in StationService/fillStation");
            System.out.println(e.getMessage());
            return null;
        }
    }

    /**
     * Saves a new Station to the db
     *
     * @param stationID the ID attempting to be created
     * @param playlist a PlaylistSimplified object
     * @return ResponseMessage with details
     */
    public ResponseMessage createStation(int stationID, PlaylistSimplified playlist)
    {
        // If there's already a Playlist in the Station number being created
        if(this.stationRepo.existsById(stationID)) {
            return new ResponseMessage("Station Exists: " + stationID);
        }

        // If there's already a Station with the given Playlist
        if(this.stationRepo.existsByPlaylistID(playlist.getId())) {
            return new ResponseMessage("Playlist Exists: " + playlist.getId());
        }

        try {
            // Create a new station, get all the tracks, add it to the db and HashMap
            PlaylistTrack[] tracks = this.spotifyApi.getPlaylistsItems(playlist.getId()).build().execute().getItems();
            Station newStation = new Station(stationID, playlist, Arrays.asList(tracks));

            System.out.println("Created newStation in stationService/createStation");

            this.saveStation(newStation);
            return new ResponseMessage("Created");
        }
        catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Spotify exception caught in StationService createStation");
            System.out.println(e.getMessage());
            return new ResponseMessage("Spotify exception error StationService createStation");
        }
        catch (IllegalArgumentException e) {
            System.out.println("IllegalArgumentException caught in StationService createStation");
            System.out.println(e.getMessage());
            return new ResponseMessage("IllegalArgumentException error StationService createStation");
        }
    }

    /**
     * Get a station from an ID
     * HashMap value
     *
     * @param stationID ID of station
     * @param checkDB whether to check the DB as well
     * @return a Station if it exists, null if it cannot be found
     */
    public Station getStation(int stationID, boolean... checkDB)
    {
        if(checkDB.length == 1 && checkDB[0]) {
            try {
                // Check if it exists in the db
                // If so, return the HashMap value (so listeners and tracks also get returned)
                if(stationRepo.existsById(stationID)) {
                    Station station = this.allStations.get(stationID);
                    // We can fill in the HashMap Transient values here, if they're empty
                    if(station.getCreator() == null) {
                        station = this.fillStationData(station);
                    }
                    return station;
                }

                return null;
            }
            catch (IllegalArgumentException e)
            {
                System.out.println("Exception caught in stationService/getStation");
                System.out.println(e.getMessage());
                return null;
            }
        }

        return this.allStations.get(stationID);
    }

    /**
     * Checks if the current logged in user is in the listeners list for a given station
     * If not, adds it to the HashMap stations list
     *
     * @param stationID ID of station
     * @return true if it exists, false if not
     */
    public boolean updateListener(int stationID)
    {
        try {
            User myUser = this.spotifyApi.getCurrentUsersProfile().build().execute();

            // If the list does not contain the userID, add user to the list
            if(!this.allStations.get(stationID).getListeners().containsKey(myUser.getId())) {
                this.addListener(stationID, myUser);
            }

            return true;
        }
        catch (IOException | SpotifyWebApiException | ParseException e) {
            System.out.println("Spotify exception caught in StationService checkListeners");
            System.out.println(e.getMessage());
            return false;
        }
    }

    /**
     * Add a Spotify User to the HashMap stations listeners list
     *
     * @param stationID id of Station
     * @param user currently logged in Spotify User object
     */
    public void addListener(int stationID, User user) {
        Station station = this.getStation(stationID, false);
        station.getListeners().put(user.getId(), user);
        this.saveStation(station);
    }

    /**
     * Remove a Spotify User from the HashMap stations listeners list
     * Interrupt the thread if the user is the last listener
     *
     * @param stationID id of Station
     * @param user currently logged in Spotify User object
     */
    public void removeListener(int stationID, User user) {
        try {
            Station station = this.getStation(stationID, false);
            station.getListeners().remove(user.getId());

            // If it's the last listener, stop the thread
            if(station.getListeners().isEmpty()) {
                Thread radio = this.allRadioThreads.get(stationID);
                radio.interrupt();
                this.allRadioThreads.remove(stationID);
            }

            // Save station
            this.saveStation(station);
        }
        catch (NullPointerException e) {
            System.out.println("NullPointer caught in StationService/removeListener");
        } catch (SecurityException e) {
            System.out.println("SecurityException caught in StationService/removeListener");
        }
    }

    /**
     * Starts a loop that continues while there are active listeners for a given Station
     * Uses a RadioThread, which uses the Runnable class
     * Adds the RadioThread to the global HashMap
     *
     * @param stationNum ID of the Station to start
     */
    public void start(int stationNum) {
        RadioThread radio = new RadioThread(this, stationNum);
        Thread worker = new Thread(radio);
        worker.start();

        this.allRadioThreads.put(stationNum, worker);
        System.out.println("Started radio #" + stationNum);
    }

    /**
     * Wrapper for station.update()
     * Also saves data to db
     *
     * @param station Station to update
     */
    public void updateStation(Station station) {
        station.update();
        this.saveStation(station);
    }

    /**
     * Method to just save Station data to db / wherever else
     * @param station Station to save
     */
    protected void saveStation(Station station) {
        this.allStations.put(station.getStationID(), station);
        this.stationRepo.save(station);
    }
}

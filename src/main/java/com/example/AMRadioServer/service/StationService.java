package com.example.AMRadioServer.service;

import com.example.AMRadioServer.model.ResponseMessage;
import com.example.AMRadioServer.model.Station;
import com.example.AMRadioServer.repository.StationRepository;
import com.wrapper.spotify.SpotifyApi;
import com.wrapper.spotify.exceptions.SpotifyWebApiException;
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

    private final SpotifyApi spotifyApi;

    @Autowired
    public StationService(StationRepository stationRepo, SpotifyApi spotifyApi) {
        this.stationRepo = stationRepo;
        this.spotifyApi = spotifyApi;
        this.allStations = new HashMap<>();

        // Initialize with all currently created Stations from db
        List<Station> all = this.stationRepo.findAll();
        for(Station station: all) {
            allStations.put(station.getStationID(), station);
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

            this.stationRepo.save(newStation);
            this.allStations.put(stationID, newStation);
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
                    return this.allStations.get(stationID);
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
     * Get all the stations from the HashMap
     *
     * @return List of Station objects
     */
    public List<Station> getAllStationsList() {
        try {
            return new ArrayList<>(this.allStations.values());
        }
        catch(Exception e)
        {
            System.out.println("Exception caught in stationService/getAllStations");
            System.out.println(e.getMessage());
            return null;
        }
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
        this.allStations.get(stationID).getListeners().put(user.getId(), user);
    }

    /**
     * Remove a Spotify User from the HashMap stations listeners list
     *
     * @param stationID id of Station
     * @param user currently logged in Spotify User object
     */
    public void removeListener(int stationID, User user) {
        try {
            this.allStations.get(stationID).getListeners().remove(user.getId());
        }
        catch (NullPointerException e) {
//            System.out.println("NullPointer caught in StationService/removeListener");
        }
    }

    /**
     * Starts a loop that continues while there are active listeners for a given Station
     * Uses a RadioThread, which uses the Runnable class
     *
     * @param stationNum ID of the Station to start
     */
    public void start(int stationNum) {
        RadioThread radio = new RadioThread(this);
        radio.setStationNum(stationNum);
        Thread worker = new Thread(radio);
        worker.start();
        System.out.println("Started radio #" + stationNum);
    }

    /**
     * Uses the Station object's update method to change the Station's properties to a next track
     * This wrapper method also saves it to db and hashmap
     *
     * @param station Station to update
     */
    public void updateStation(Station station) {
        station.update(this.spotifyApi);

        // Save to HashMap and db
        this.allStations.put(station.getStationID(), station);
        this.stationRepo.save(station);
    }
}

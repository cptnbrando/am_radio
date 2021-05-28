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
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.*;

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
    private HashMap<Integer, Station> allStations;

    private final SpotifyApi spotifyApi;

    @Autowired
    public StationService(StationRepository stationRepo, SpotifyApi spotifyApi) {
        this.stationRepo = stationRepo;
        this.spotifyApi = spotifyApi;
        this.allStations = new HashMap<>();

        // Initialize with all currently created Stations
        List<Station> all = this.getAllStations();
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
            // Create a new station, set all the tracks, add it to the db and HashMap
            PlaylistTrack[] tracks = this.spotifyApi.getPlaylistsItems(playlist.getId()).build().execute().getItems();
            Station newStation = new Station(stationID, playlist, Arrays.asList(tracks));

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
     *
     * @param stationID ID of station
     * @return a Station if it exists, null if it cannot be found
     */
    public Station getStation(int stationID)
    {
        try {
            // Make sure it exists in the db
            // If so, return the HashMap value (so listeners and tracks also get returned)
            if(stationRepo.existsById(stationID))
            {
                return this.allStations.get(stationID);
            }

            return null;
        }
        catch (Exception e)
        {
            System.out.println("Exception caught in StationService getStation");
            System.out.println(e.getMessage());
            return null;
        }
    }

    /**
     * Get all the stations from the db
     *
     * @return List of Station objects
     */
    public List<Station> getAllStations() {
        try {
            return this.stationRepo.findAll();
        }
        catch(Exception e)
        {
            System.out.println("Exception caught in getAllStations");
            System.out.println(e.getMessage());
            return null;
        }
    }

    /**
     * Checks if the current logged in user is in the listeners list for a given station
     * If not, adds it to the list
     *
     * @param stationID ID of station
     * @return true if it exists, false if not
     */
    public boolean updateListener(int stationID)
    {
        try {
            User myUser = this.spotifyApi.getCurrentUsersProfile().build().execute();

            // If the list does not contain the userID, add user to the list
            if(!this.getStation(stationID).getListeners().containsKey(myUser.getId())) {
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
     * Add a Spotify User to a station's listeners list
     *
     * @param stationID id of Station
     * @param user currently logged in Spotify User object
     */
    public void addListener(int stationID, User user) {
        this.getStation(stationID).getListeners().put(user.getId(), user);
    }

    /**
     * Starts a loop that continues while there are active listeners for a given Station
     *
     * @param station the Station to start
     */
    public void start(Station station)
    {
//        // Create a new thread through an Executor
//        ExecutorService executor = Executors.newSingleThreadExecutor();
//        Future future = executor.submit(new Callable() {
//            public String call() throws Exception {
//                //do operations you want
//                return "OK";
//            }
//        });
//
//        // Here we use a while loop to continue getting new songs as long as there are present listeners
//        // We want to wait until the current system time is past the playTime + currentTrack time
//        // TODO: learn how tf to do this lol
//        try {
////            while(!station.getListeners().isEmpty())
////            {
////
////            }
//            System.out.println(future.get(2, TimeUnit.SECONDS)); //timeout is in 2 seconds
//        } catch (TimeoutException | InterruptedException | ExecutionException e) {
//            System.err.println("Timeout");
//        }
//        executor.shutdownNow();
    }

    /**
     * Change the current to the next and get a new random next track
     *
     * @param station the Station to update
     */
    public Station update(Station station)
    {
        // Refresh the tracks list
        if(station.getTracks().isEmpty())
        {
            try {
                PlaylistTrack[] all = this.spotifyApi.getPlaylistsItems(station.getPlaylistID()).build().execute().getItems();
                List<PlaylistTrack> trackList = Arrays.asList(all);
                Collections.shuffle(trackList);
                station.setTracks(trackList);
                this.allStations.put(station.getStationID(), station);
            }
            catch (IOException | SpotifyWebApiException | ParseException e) {
                System.out.println("Spotify exception caught in StationService update");
                System.out.println(e.getMessage());
            }
        }

        // Current to next
        station.setCurrent(station.getNext());

        // Set a random next track
        int rnd = new Random().nextInt(station.getTracks().size());
        station.setNext(station.getTracks().remove(rnd).getTrack().getId());

        return station;
    }
}

package com.example.AMRadioServer.controller;

import com.example.AMRadioServer.model.ResponseMessage;
import com.example.AMRadioServer.model.Station;
import com.example.AMRadioServer.service.StationService;
import com.wrapper.spotify.exceptions.SpotifyWebApiException;
import com.wrapper.spotify.model_objects.specification.PlaylistSimplified;
import com.wrapper.spotify.model_objects.specification.User;
import com.wrapper.spotify.requests.data.player.GetUsersCurrentlyPlayingTrackRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
@RequestMapping("/api/station")
public class StationController extends SpotifyPlayerController {

    private final StationService stationService;

    @Autowired
    public StationController(StationService stationService) {
        super(stationService.getSpotifyApi());
        this.stationService = stationService;
    }

    /**
     * Create a new Station, if it's available
     *
     * @param stationID ID of the Station
     * @param playlist Station object
     * @return Response Message with details
     */
    @PostMapping(value = "/{stationID}")
    public ResponseMessage insertNewStation(@PathVariable("stationID") int stationID, @RequestBody PlaylistSimplified playlist) throws SpotifyWebApiException {
        return this.stationService.createStation(stationID, playlist);
    }

    /**
     * Get a Station, if it exists
     * Starts it if user is the first listener
     *
     * @param stationID the ID of the Station
     * @return a Station object
     */
    @GetMapping(value = "/{stationID}")
    public Station getStation(@PathVariable("stationID") int stationID) {
        return this.stationService.getStation(stationID, true);
    }

    /**
     * Gets all stations from the HashMap
     * @return List of all Stations
     */
    @GetMapping(value = "/all")
    public List<Station> getAllStations() {
        return this.stationService.getAll();
    }

    /**
     * Start or join the station
     *
     * @param stationID ID of station to join
     */
    @GetMapping(value = "/{stationID}/join")
    public Station joinStation(@PathVariable("stationID") int stationID) throws SpotifyWebApiException {
        Station station = this.stationService.getStation(stationID, false);
//        System.out.println("Join: " + station.getStationID());
        if(station == null) {
            return null;
        }

        // Set repeat and shuffle to off
        super.shuffle(false);
        super.repeat("off");

        // Add the listener
        this.stationService.updateListener(stationID);

        // If the station's not playing, start it
        if(!station.isPlaying()) {
            this.stationService.start(stationID);
        }

        // Wait a second for the fields to get right, then get the station again
        try {
            Thread.sleep(1000);
            station = this.stationService.getStation(stationID, false);

            // Check if the station is playing. If not, add a delay and try again!
            // System.currentTime - station.getPlayTime
            if(!station.isPlaying()) {
                Thread.sleep(1000);
                station = this.stationService.getStation(stationID, false);
            }

            // Play the track if the current playing track is not the current station track
            // Seek the track and play
            if(station.isPlaying()) {
                // If the track is not already playing, we probably need to play the track AND queue up the next one
                if(!super.playCheck(station.getCurrentURI())) {
                    if(super.playTrack(station.getCurrentURI())) {
                        // Add the next one to the queue
                        super.addToQueue(station.getNextURI());
                    }
                }

                // If it's already playing immediately, just seek to the time. No queue. Delay...
                Thread.sleep(800);
                super.seek((int) (System.currentTimeMillis() - station.getPlayTime()));
            }

            return station;
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
            return station;
        }
    }

    /**
     * Leave the station
     *
     * @param stationID ID of station to leave
     */
    @GetMapping(value = "/{stationID}/leave")
    public void leaveStation(@PathVariable("stationID") int stationID) {
        // Remove user from listeners list
        User user = super.getUser();
        this.stationService.removeListener(stationID, user);
    }

    /**
     * Delete a station if the logged in user owns it
     *
     * @param stationID the station to delete
     * @param user the user that owns it
     * @return ResponseMessage detailing success or not
     */
    @PutMapping(value = "/{stationID}/delete")
    public ResponseMessage deleteStation(@PathVariable("stationID") int stationID, @RequestBody User user) {
        Station station = this.stationService.getStation(stationID);
        // If no station found
        if(station == null) {
            return new ResponseMessage("No station found");
        }

        User found = station.getCreator();
        // If the user given does not match the owner
        if(!user.getId().equals(found.getId())) {
            return new ResponseMessage("Bad user");
        }

        // If it's good, delete the station
        this.stationService.deleteStation(station);
        return new ResponseMessage("Station deleted");
    }

    /**
     * Plays and seeks the currently playing Station track to the synced value
     * @param stationID Station to sync to
     */
    @GetMapping(value = "/{stationID}/sync")
    public void sync(@PathVariable("stationID") int stationID) throws SpotifyWebApiException, InterruptedException {
        // Get the station
        Station station = this.stationService.getStation(stationID);

        System.out.println("/sync for: " + stationID);
        this.play();
        // Play the currently playing track
        if(this.playTrack(station.getCurrentURI())) {
            System.out.println("synced played track");
            // Wait a second...
            Thread.sleep(1000);

            // Seek current to the right time
            this.seek((int) (System.currentTimeMillis() - station.getPlayTime()));

            // Queue up the next track
            this.addToQueue(station.getNextURI());
        }
    }
}

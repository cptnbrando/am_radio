package com.example.AMRadioServer.controller;

import com.example.AMRadioServer.model.ResponseMessage;
import com.example.AMRadioServer.model.Station;
import com.example.AMRadioServer.service.StationService;
import com.wrapper.spotify.model_objects.specification.PlaylistSimplified;
import com.wrapper.spotify.model_objects.specification.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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
    public ResponseMessage insertNewStation(@PathVariable("stationID") int stationID, @RequestBody PlaylistSimplified playlist) {
        System.out.println("stationController/insertNewStation");
        System.out.println(playlist.getId());
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
     * Start or join the station
     *
     * @param stationID ID of station to join
     */
    @GetMapping(value = "/{stationID}/join")
    public void joinStation(@PathVariable("stationID") int stationID) throws InterruptedException {
        Station station = this.stationService.getStation(stationID, false);

        // Set repeat and shuffle to off
        super.shuffle(false);
        super.repeat("off");

        // Add the listener
        User user = super.getUser();
        this.stationService.addListener(stationID, user);

        // If the station's not playing, start it
        if(!this.stationService.getStation(stationID, false).isPlaying()) {
            this.stationService.start(stationID);

            // wait a few seconds for the current and next fields to get populated
            Thread.sleep(5000);
            // then play the current track and queue up the next one
            super.playTrack(station.getCurrentURI());
            super.playNext(station.getNextURI());
        }

        // if the station IS playing, we play the current track and seek it to the right time
        // System.currentTime - station.getPlayTime
        super.playTrack(station.getCurrentURI());
        super.seek((int) (System.currentTimeMillis() - station.getPlayTime()));
        super.playNext(station.getNextURI());
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
}

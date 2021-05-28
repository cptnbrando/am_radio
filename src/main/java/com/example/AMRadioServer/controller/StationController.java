package com.example.AMRadioServer.controller;

import com.example.AMRadioServer.model.ResponseMessage;
import com.example.AMRadioServer.model.Station;
import com.example.AMRadioServer.service.StationService;
import com.wrapper.spotify.model_objects.specification.PlaylistSimplified;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityNotFoundException;

@RestController
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
@RequestMapping("/api/station")
public class StationController {

    private final StationService stationService;

    @Autowired
    public StationController(StationService stationService) {
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
        System.out.println("insertNewStation");
        System.out.println(playlist.getId());
        return this.stationService.createStation(stationID, playlist);
    }

    /**
     * Get a Station, if it exists
     *
     * @param stationID the ID of the Station
     * @return a Station object
     */
    @GetMapping(value = "/{stationID}")
    public Station getStation(@PathVariable("stationID") int stationID) {
        return this.stationService.getStation(stationID);
    }
}

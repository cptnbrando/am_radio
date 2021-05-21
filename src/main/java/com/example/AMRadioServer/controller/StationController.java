package com.example.AMRadioServer.controller;

import com.example.AMRadioServer.model.ResponseMessage;
import com.example.AMRadioServer.model.Station;
import com.example.AMRadioServer.service.StationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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
     * @param stationID
     * @param station
     * @return
     */
    @PutMapping(value = "/{stationID}/new")
    public ResponseMessage insertNewStation(@PathVariable("stationID") int stationID, @RequestBody Station station)
    {
        if(this.stationService.getStationRepo().existsById(stationID)) {
            return new ResponseMessage("Exists");
        }

        // TODO send back the link to the station of the URL in existence
        if(this.stationService.getStationRepo().existsByStationURL(station.getStationURL()))
        {
            return new ResponseMessage("URL Exists");
        }

        try {
            this.stationService.getStationRepo().save(station);
            return new ResponseMessage("Yeehaw");
        }
        catch (Exception e)
        {
            e.printStackTrace();
            return new ResponseMessage("Error");
        }
    }

    @GetMapping(value = "/{stationID}")
    public Station getStation(@PathVariable("stationID") int stationID) {
        try{
            return this.stationService.getStationRepo().getOne(stationID);
        }
        catch (Exception e)
        {
            // Maybe the station doesn't exist
            e.printStackTrace();
            return null;
        }
    }
}

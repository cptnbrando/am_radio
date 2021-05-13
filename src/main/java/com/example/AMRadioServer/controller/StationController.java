package com.example.AMRadioServer.controller;

import com.example.AMRadioServer.model.ResponseMessage;
import com.example.AMRadioServer.model.Station;
import com.example.AMRadioServer.repository.StationRepository;
import com.example.AMRadioServer.service.StationService;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/station")
@NoArgsConstructor
@Getter
@Setter
public class StationController {

    private StationService stationRepo;

    @Autowired
    public StationController(StationRepository stationRepo) {
        this.stationRepo = stationRepo;
    }

    @PutMapping(value = "/{stationID}/new")
    public ResponseMessage insertNewStation(@PathVariable("stationID") int stationID, @RequestBody Station station)
    {
        if(stationRepo.existsById(stationID)) {
            return new ResponseMessage("Exists");
        }

        // TODO send back the link to the station of the URL in existence
        if(stationRepo.existsByStationURL(station.getStationURL()))
        {
            return new ResponseMessage("URL Exists");
        }

        try {
            stationRepo.save(station);
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
            return this.stationRepo.getOne(stationID);
        }
        catch (Exception e)
        {
            // Maybe the station doesn't exist
            e.printStackTrace();
            return null;
        }
    }
}

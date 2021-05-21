package com.example.AMRadioServer.service;

import com.example.AMRadioServer.model.ResponseMessage;
import com.example.AMRadioServer.model.Station;
import com.example.AMRadioServer.repository.StationRepository;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
@NoArgsConstructor
@Getter
@Setter
public class StationService {
    private StationRepository stationRepo;

    @Autowired
    public StationService(StationRepository stationRepo) {
        this.stationRepo = stationRepo;
    }

    /**
     * Saves a new Station to the db
     *
     * @param station a new Station object
     */
    public ResponseMessage createStation(Station station)
    {
        try {
            this.stationRepo.save(station);
            return new ResponseMessage("Created");
        }
        catch (Exception e)
        {
            System.out.println("Exception caught in StationService createStation");
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Get the current song for a specified station
     *
     * @param station the station to get data for
     * @return the URI of a currently playing song
     */
    public String getCurrentSong(Station station)
    {
        return station.getCurrent();
    }
}

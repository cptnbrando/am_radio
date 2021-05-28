package com.example.AMRadioServer.service;

import com.example.AMRadioServer.model.ResponseMessage;
import com.example.AMRadioServer.model.Station;
import com.example.AMRadioServer.repository.StationRepository;
import com.wrapper.spotify.model_objects.specification.PlaylistSimplified;
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
@Getter
@Setter
@NoArgsConstructor
public class StationService {
    private StationRepository stationRepo;

    @Autowired
    public StationService(StationRepository stationRepo) {
        this.stationRepo = stationRepo;
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
            Station newStation = new Station(stationID, playlist);

            this.stationRepo.save(newStation);
            return new ResponseMessage("Created");
        }
        catch (Exception e) {
            System.out.println("Exception caught in StationService createStation");
            System.out.println(e.getMessage());
            return new ResponseMessage("Server Error StationService createStation");
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
            if(stationRepo.existsById(stationID))
            {
                return this.stationRepo.findById(stationID).get();
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
}

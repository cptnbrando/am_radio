package com.example.AMRadioServer.controller;

import com.example.AMRadioServer.model.Station;
import com.example.AMRadioServer.service.StationService;
import com.wrapper.spotify.model_objects.specification.User;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;
import java.util.List;

@RestController
@Data
public class WebSocketController {

    @Autowired
    private StationService stationService;

    @MessageMapping("/stations")
    @SendTo("/topic/stations")
    public List<Station> getStations() {
        return stationService.getAllStations();
    }

    /**
     * Gets a given Station
     * If User if first connected listener, begin a playback loop to update Station
     *
     * @param stationID ID of station
     * @return a Station object
     */
    @MessageMapping("/stations/{stationID}")
    @SendTo("/topic/stations/{stationID}")
    public Station getStation(@PathVariable int stationID) {
        return stationService.getStation(stationID);
    }

    /**
     * Gets and updates the listeners list for a given StationID
     *
     * @param stationID ID of station to check
     * @return Collection of User objects from station's listeners HashMap
     * @throws Exception Websocket Exception
     */
    @MessageMapping("/stations/{stationID}/listeners")
    @SendTo("/topic/stations/{stationID}/listeners")
    public Collection<User> sendListeners(@PathVariable int stationID) throws Exception
    {
        // Use service to check/update listener's list
        if(!this.stationService.updateListener(stationID)) {
            return null;
        }

        return this.stationService.getStation(stationID).getListeners().values();
    }
}

package com.example.AMRadioServer.controller;

import com.example.AMRadioServer.model.Station;
import com.example.AMRadioServer.service.StationService;
import com.wrapper.spotify.model_objects.specification.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;
import java.util.List;

@Controller
public class WebSocketController {

    private final StationService stationService;
    private final SimpMessagingTemplate template;

    @Autowired
    public WebSocketController(StationService stationService, SimpMessagingTemplate template) {
        this.stationService = stationService;
        this.template = template;
    }

    @MessageMapping("/radio")
    @SendTo("/topic/stations")
    public List<Station> getStations() {
        System.out.println("in WSController/getAllStations");
        return stationService.getAllStationsList();
    }

    @MessageMapping("/send/message")
    public void sendMessage(String message) {
        System.out.println(message);
        this.template.convertAndSend("/message", message);
    }

    /**
     * Gets a given Station
     * If User is first connected listener, begin a playback loop to update Station
     *
     * @param stationID ID of station
     * @return a Station object
     */
    @MessageMapping("/radio/{stationID}")
    @SendTo("/topic/stations/{stationID}")
    public Station getStation(@PathVariable("stationID") int stationID)
    {
        System.out.println("in WSController/getStation");

        Station myStation = stationService.getStation(stationID, true);

        // Check if the station has any listeners
        if(myStation.getListeners().isEmpty())
        {
            System.out.println(stationID + " found empty listeners");
            // If it does, add the current user to the listeners list
            // If this is successful, start the station
            if(stationService.updateListener(stationID)) {
                stationService.start(stationID);
            }
        }

        return myStation;
    }

    /**
     * Gets and updates the listeners list for a given StationID
     *
     * @param stationID ID of station to check
     * @return Collection of User objects from station's listeners HashMap
     * @throws Exception Websocket Exception
     */
    @MessageMapping("/radio/{stationID}/listeners")
    @SendTo("/topic/stations/{stationID}/listeners")
    public Collection<User> sendListeners(@PathVariable("stationID")int stationID) throws Exception
    {
        System.out.println("in WSController/sendListeners");
        // Use service to check/update listener's list
        if(!this.stationService.updateListener(stationID)) {
            return null;
        }

        return this.stationService.getStation(stationID).getListeners().values();
    }
}

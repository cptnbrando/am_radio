package com.example.AMRadioServer.controller;

import com.example.AMRadioServer.model.Station;
import com.wrapper.spotify.model_objects.specification.User;
import lombok.Data;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@Data
public class WebSocketController {

    private ArrayList<Station> stations;

    @MessageMapping("/stations")
    @SendTo("/topic/stations")
    public List<Station> getStations() {
        return stations;
    }
}

package com.example.AMRadioServer.controller;

import com.example.AMRadioServer.service.StationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.HashMap;

@Controller
public class WebSocketController {

    private final StationService stationService;
    private final HashMap<Integer, SimpMessagingTemplate> stationTemplates;
    private final SimpMessagingTemplate global;

    @Autowired
    public WebSocketController(StationService stationService, SimpMessagingTemplate global) {
        this.stationService = stationService;
        this.global = global;
        this.stationTemplates = new HashMap<>();
    }

    /**
     * Sends a message to the global chatroom
     * Updates the global SimpMessagingTemplate object,
     * which gets updated for those subscribed to server/socket/message
     *
     * @param message text message to send
     */
    @MessageMapping("/send/message")
    public void sendMessage(String message) {
        this.global.convertAndSend("/message", message);
    }

    /**
     * Sends a message to the global chatroom
     * Updates the global SimpMessagingTemplate object,
     * which gets updated for those subscribed to server/socket/message
     *
     * @param message text message to send
     */
    @MessageMapping("/send/message/{stationID}")
    public void sendStationMessage(String message, @PathVariable("stationID") int stationID) {
        this.global.convertAndSend("/message", message);
    }
}

package com.example.AMRadioServer.controller;

import com.google.gson.JsonArray;
import com.wrapper.spotify.SpotifyApi;
import com.wrapper.spotify.exceptions.SpotifyWebApiException;
import com.wrapper.spotify.model_objects.miscellaneous.CurrentlyPlayingContext;
import lombok.NoArgsConstructor;
import org.apache.hc.core5.http.ParseException;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/spotify/player")
@NoArgsConstructor
@CrossOrigin
public class SpotifyPlayerController
{
    private final SpotifyApi spotifyApi = SpotifyController.getSpotifyApi();

    @GetMapping(value = "/getPlayer")
    public CurrentlyPlayingContext getPlayer() {
        try {
            return this.spotifyApi.getInformationAboutUsersCurrentPlayback().build().execute();
        }
        catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception in player/getPlayer");
            e.printStackTrace();
            return null;
        }
    }

    @PostMapping(value = "/next")
    public void next() {
        try {
            this.spotifyApi.skipUsersPlaybackToNextTrack().build().execute();
        }
        catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception in player/next");
            e.printStackTrace();
        }
    }

    @PutMapping(value = "/play")
    public void play() {
        try {
            this.spotifyApi.startResumeUsersPlayback().build().execute();
        }
        catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception in player/play");
            e.printStackTrace();
        }
    }

    @PutMapping(value = "/pause")
    public void pause() {
        try {
            this.spotifyApi.pauseUsersPlayback().build().execute();
        }
        catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception in player/pause");
            e.printStackTrace();
        }
    }

    /**
     * Give this a time in milliseconds and it will seek the current device to that time!
     * @param time ms time
     */
    @PutMapping(value = "/seek")
    public void seek(@RequestParam int time) {
        try {
            this.spotifyApi.seekToPositionInCurrentlyPlayingTrack(time).build().execute();
        }
        catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception in player/seek");
            e.printStackTrace();
        }
    }

    @PutMapping(value = "/shuffle")
    public void shuffle(@RequestParam boolean activate) {
        try {
            this.spotifyApi.toggleShuffleForUsersPlayback(activate).build().execute();
        }
        catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception in player/shuffle");
            e.printStackTrace();
        }
    }

    @PutMapping(value = "/playOn")
    public void playOn(@RequestParam String deviceID)
    {
        //Creating a JSON Array device_ids object
        JsonArray device_ids = new JsonArray();
        device_ids.add(deviceID);

        try {
            this.spotifyApi.transferUsersPlayback(device_ids).build().execute();
        }
        catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception in player/playOn");
            e.printStackTrace();
        }
    }

    /**
     * Change the volume of the spotify player
     * @param percent 0 - 100 percent int value
     */
    @PutMapping(value = "/volume")
    public void volume(@RequestParam int percent)
    {
        try {
            this.spotifyApi.setVolumeForUsersPlayback(percent).build().execute();
        }
        catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception in player/volume");
            e.printStackTrace();
        }
    }
}

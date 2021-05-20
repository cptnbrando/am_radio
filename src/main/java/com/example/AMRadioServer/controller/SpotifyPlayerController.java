package com.example.AMRadioServer.controller;

import com.example.AMRadioServer.model.ResponseMessage;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.wrapper.spotify.SpotifyApi;
import com.wrapper.spotify.exceptions.SpotifyWebApiException;
import com.wrapper.spotify.model_objects.miscellaneous.CurrentlyPlaying;
import com.wrapper.spotify.model_objects.miscellaneous.CurrentlyPlayingContext;
import com.wrapper.spotify.model_objects.miscellaneous.Device;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.apache.hc.core5.http.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.io.IOException;

@RestController
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
@SessionAttributes("spotifyApi")
@RequestMapping("/api/spotify/player")
public class SpotifyPlayerController
{
    private SpotifyApi spotifyApi;

    @Autowired
    public SpotifyPlayerController(SpotifyApi spotifyApi) {
        this.spotifyApi = spotifyApi;
    }

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

    @GetMapping(value = "/getCurrentlyPlaying")
    public CurrentlyPlaying getCurrentlyPlaying() {
        try {
            return this.spotifyApi.getUsersCurrentlyPlayingTrack().build().execute();
        } catch (IOException | SpotifyWebApiException | ParseException e)
        {
            return null;
        }
    }

    @PostMapping(value = "/next")
    public boolean next() {
        try {
            this.spotifyApi.skipUsersPlaybackToNextTrack().build().execute();
            return true;
        }
        catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception in player/next");
            e.printStackTrace();
            return false;
        }
    }

    @PutMapping(value = "/play")
    public boolean play() {
        try {
            this.spotifyApi.startResumeUsersPlayback().build().execute();
            return true;
        }
        catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception in player/play");
            e.printStackTrace();
            return false;
        }
    }

    @PutMapping(value = "/pause")
    public boolean pause() {
        try {
            this.spotifyApi.pauseUsersPlayback().build().execute();
            return true;
        }
        catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception in player/pause");
            e.printStackTrace();
            return false;
        }
    }

    /**
     * There's no way to play directly from a URI
     * ...sooo we set it to the queue, then skip to the next song
     * this works for now, but might get stupid once the stations and queues are implemented
     * @param trackURI
     * @return
     */
    @PutMapping(value = "/playTrack")
    public boolean playTrack(@RequestParam(name = "trackURI") String trackURI)
    {
        System.out.println(trackURI);
        try {
            this.spotifyApi.addItemToUsersPlaybackQueue(trackURI).build().execute();
            this.spotifyApi.skipUsersPlaybackToNextTrack().build().execute();
            return true;
        }
        catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception in player/pause");
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Give this a time in milliseconds and it will seek the current device to that time!
     * @param time ms time
     */
    @PutMapping(value = "/seek")
    public boolean seek(@RequestParam int time) {
        try {
            this.spotifyApi.seekToPositionInCurrentlyPlayingTrack(time).build().execute();
            return true;
        }
        catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception in player/seek");
            e.printStackTrace();
            return false;
        }
    }

    @PutMapping(value = "/shuffle")
    public boolean shuffle(@RequestParam boolean activate) {
        try {
            this.spotifyApi.toggleShuffleForUsersPlayback(activate).build().execute();
            return true;
        }
        catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception in player/shuffle");
            e.printStackTrace();
            return false;
        }
    }

    @GetMapping(value = "/getDevices")
    public Device[] getDevices() {
        try {
            return this.spotifyApi.getUsersAvailableDevices().build().execute();
        } catch (IOException | SpotifyWebApiException | ParseException e) {
            System.out.println("Exception in getDevices");
            e.printStackTrace();
            return null;
        }
    }

    /**
     * There's only a route to get all of a user's available devices
     * Loop through that and return it if it's active
     * Also get the currently playing track and return the device if there's a track there
     * @return an active Device
     */
    @GetMapping(value = "/getCurrentDevice")
    public Device getCurrentDevice() {
        Device[] myDevices = this.getDevices();
        CurrentlyPlaying track = this.getCurrentlyPlaying();
        if(track != null && myDevices != null)
        {
            for(Device device: myDevices)
            {
                if(device.getIs_active())
                {
                    return device;
                }
            }
        }

        return null;
    }

    /**
     * Goes through the list of devices and returns am_radio if it can be found
     * Sets it to the active player and returns the device
     * @return a spotify player device named am_radio
     */
    @GetMapping(value = "/getAMRadio")
    public Device getAMRadio() {
        Device[] myDevices = this.getDevices();
        if(myDevices != null)
        {
            for(Device device: myDevices)
            {
                if(device.getName().equals("am_radio"))
                {
                    return this.playOn(device.getId());
                }
            }
        }

        return null;
    }

    /**
     * Transfers playback to the given device, if the given id is valid
     * Returns the currently playing device, which should be am_radio
     * @param deviceID
     * @return the current device playing
     */
    @PutMapping(value = "/playOn")
    public Device playOn(@RequestParam String deviceID)
    {
        //Create a JSONArray and add the ID
        JsonArray deviceArray = new JsonArray();
        deviceArray.add(deviceID);

        try {
            this.spotifyApi.transferUsersPlayback(deviceArray).build().execute();
            return this.getCurrentDevice();
        }
        catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception in player/playOn");
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Change the volume of the spotify player
     * @param percent 0 - 100 percent int value
     */
    @PutMapping(value = "/volume")
    public boolean volume(@RequestParam int percent)
    {
        try {
            this.spotifyApi.setVolumeForUsersPlayback(percent).build().execute();
            return true;
        }
        catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception in player/volume");
            e.printStackTrace();
            return false;
        }
    }
}

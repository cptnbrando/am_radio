package com.example.AMRadioServer.controller;

import com.google.gson.JsonArray;
import com.wrapper.spotify.SpotifyApi;
import com.wrapper.spotify.exceptions.SpotifyWebApiException;
import com.wrapper.spotify.model_objects.miscellaneous.AudioAnalysis;
import com.wrapper.spotify.model_objects.miscellaneous.CurrentlyPlaying;
import com.wrapper.spotify.model_objects.miscellaneous.CurrentlyPlayingContext;
import com.wrapper.spotify.model_objects.miscellaneous.Device;
import com.wrapper.spotify.model_objects.specification.AudioFeatures;
import com.wrapper.spotify.model_objects.specification.User;
import org.apache.hc.core5.http.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
@SessionAttributes("spotifyApi")
@RequestMapping("/api/spotify/player")
public class SpotifyPlayerController
{
    private final SpotifyApi spotifyApi;

    @Autowired
    public SpotifyPlayerController(SpotifyApi spotifyApi) {
        this.spotifyApi = spotifyApi;
    }

    /**
     * Get the Player
     *
     * @return CurrentlyPlayingContext for the Player
     */
    @GetMapping(value = "/getPlayer")
    public CurrentlyPlayingContext getPlayer() {
        try {
            return this.spotifyApi.getInformationAboutUsersCurrentPlayback().build().execute();
        }
        catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception in player/getPlayer");
            System.out.println(e.getMessage());
            return null;
        }
    }

    /**
     * Get the currently playing track, if there is one
     *
     * @return CurrentlyPlaying for track
     */
    @GetMapping(value = "/getCurrentlyPlaying")
    public CurrentlyPlaying getCurrentlyPlaying() {
        try {
            return this.spotifyApi.getUsersCurrentlyPlayingTrack().build().execute();
        } catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception in player/getCurrentlyPlaying");
            System.out.println(e.getMessage());
            return null;
        }
    }

    /**
     * Skip to the next track in a User's queue
     *
     * @return true if successful, false if not
     */
    @PostMapping(value = "/next")
    public boolean next() {
        try {
            this.spotifyApi.skipUsersPlaybackToNextTrack().build().execute();
            return true;
        }
        catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception in player/next");
            System.out.println(e.getMessage());
            return false;
        }
    }

    /**
     * Removes all items from the queue and queues up the given track
     * TODO there's currently no way in the web api to clear a user's queue... arghhhh
     *
     * @param trackURI URI of track to queue
     */
    protected void playNext(String trackURI) {
        try {
            this.spotifyApi.addItemToUsersPlaybackQueue(trackURI).build().execute();
        }
        catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception in player/playNext");
            System.out.println(e.getMessage());
        }
    }

    /**
     * Play the Player
     *
     * @return true if successful, false if not
     */
    @PutMapping(value = "/play")
    public boolean play() {
        try {
            this.spotifyApi.startResumeUsersPlayback().build().execute();
            return true;
        }
        catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception in player/play");
            System.out.println(e.getMessage());
            return false;
        }
    }

    /**
     * Pause the Player
     *
     * @return true if successful, false if not
     */
    @PutMapping(value = "/pause")
    public boolean pause() {
        try {
            this.spotifyApi.pauseUsersPlayback().build().execute();
            return true;
        }
        catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception in player/pause");
            System.out.println(e.getMessage());
            return false;
        }
    }

    /**
     * There's no way to play directly from a URI
     * ...sooo we set it to the queue, then skip to the next song
     * this works for now, but might get stupid once the stations and queues are used more...
     *
     * @param trackURI track to play
     * @return true if successful, false if not
     */
    @PutMapping(value = "/playTrack")
    public boolean playTrack(@RequestParam(name = "trackURI") String trackURI)
    {
        try {
            this.spotifyApi.addItemToUsersPlaybackQueue(trackURI).build().execute();
            this.spotifyApi.skipUsersPlaybackToNextTrack().build().execute();
            return true;
        }
        catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception caught in player/pause");
            System.out.println(e.getMessage());
            return false;
        }
    }

    /**
     * Transfers playback to the given device, if the given id is valid
     * Returns the currently playing device, which should be am_radio
     *
     * @param deviceID id of valid available device
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
            System.out.println(e.getMessage());
            return null;
        }
    }

    /**
     * Goes through the list of devices and returns am_radio if it can be found
     * Sets it to the active player, plays the track, and returns the device
     *
     * @return a spotify player device named am_radio
     * TODO: if there's another am_radio instance connected, set it to that one and return a bad response
     */
    @GetMapping(value = "/getAMRadio")
    public Device getAMRadio() {
        System.out.println("/getAMRadio");
        Device[] myDevices = this.getDevices();
        System.out.println(myDevices);
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
     * Give this a time in milliseconds and it will seek the current device to that time!
     *
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
            System.out.println("Exception caught in player/seek");
            System.out.println(e.getMessage());
            return false;
        }
    }

    /**
     * Toggle shuffle mode for the player
     *
     * @param activate whether to shuffle it or not
     * @return true if successful, false if not
     */
    @PutMapping(value = "/shuffle")
    public boolean shuffle(@RequestParam boolean activate) {
        try {
            this.spotifyApi.toggleShuffleForUsersPlayback(activate).build().execute();
            return true;
        }
        catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception caught in player/shuffle");
            System.out.println(e.getMessage());
            return false;
        }
    }

    /**
     * Toggle repeat mode for the player
     *
     * @param repeat track (track repeat), context (album, playlist repeat), or off
     * @return true if successful, false if not
     */
    @PutMapping(value = "/repeat")
    public boolean repeat(@RequestParam String repeat) {
        try {
            this.spotifyApi.setRepeatModeOnUsersPlayback(repeat).build().execute();
            return true;
        }
        catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception caught in player/repeat");
            System.out.println(e.getMessage());
            return false;
        }
    }

    @GetMapping(value = "/getAudioFeatures")
    public AudioFeatures getAudioFeatures(@RequestParam String trackID)
    {
        try {
            return this.spotifyApi.getAudioFeaturesForTrack(trackID).build().execute();
        } catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception caught in player/getAudioFeatures");
            System.out.println(e.getMessage());
            return null;
        }
    }

    @GetMapping(value = "/getAudioAnalysis")
    public AudioAnalysis getAudioAnalysis(@RequestParam String trackID)
    {
        try {
            return this.spotifyApi.getAudioAnalysisForTrack(trackID).build().execute();
        } catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception caught in player/getAudioAnalysis");
            System.out.println(e.getMessage());
            return null;
        }
    }


    /**
     * Get all currently available devices for the user
     *
     * @return Device[] of all found Devices
     */
    @GetMapping(value = "/getDevices")
    public Device[] getDevices() {
        try {
            return this.spotifyApi.getUsersAvailableDevices().build().execute();
        } catch (IOException | SpotifyWebApiException | ParseException e) {
            System.out.println("Exception caught in player/getDevices");
            System.out.println(e.getMessage());
            return null;
        }
    }

    /**
     * There's only a route to get all of a user's available devices
     * Loop through that and return it if it's active
     *
     * @return an active Device
     */
    @GetMapping(value = "/getCurrentDevice")
    public Device getCurrentDevice() {
        Device[] myDevices = this.getDevices();

        if(myDevices != null)
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
     * Get the logged in user
     *
     * @return the logged in User
     */
    protected User getUser() {
        try {
            return this.spotifyApi.getCurrentUsersProfile().build().execute();
        }
        catch (IOException | SpotifyWebApiException | ParseException e) {
            System.out.println("Exception caught in player/getUser");
            System.out.println(e.getMessage());
            return null;
        }
    }


    /**
     * Change the volume of the spotify player
     *
     * @param percent 0 - 100 percent int value
     * @return true if successful, false if not
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
            System.out.println(e.getMessage());
            return false;
        }
    }
}

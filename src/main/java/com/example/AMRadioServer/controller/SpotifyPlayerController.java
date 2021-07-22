package com.example.AMRadioServer.controller;

import com.google.gson.JsonArray;
import com.wrapper.spotify.SpotifyApi;
import com.wrapper.spotify.exceptions.SpotifyWebApiException;
import com.wrapper.spotify.model_objects.miscellaneous.CurrentlyPlaying;
import com.wrapper.spotify.model_objects.miscellaneous.CurrentlyPlayingContext;
import com.wrapper.spotify.model_objects.miscellaneous.Device;
import com.wrapper.spotify.model_objects.specification.*;
import com.wrapper.spotify.requests.data.player.AddItemToUsersPlaybackQueueRequest;
import com.wrapper.spotify.requests.data.player.GetUsersCurrentlyPlayingTrackRequest;
import com.wrapper.spotify.requests.data.player.SkipUsersPlaybackToNextTrackRequest;
import org.apache.hc.core5.http.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Random;
import java.util.concurrent.*;

@RestController
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
@SessionAttributes("spotifyApi")
@RequestMapping("/api/spotify/player")
public class SpotifyPlayerController {
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
    public CurrentlyPlayingContext getPlayer() throws SpotifyWebApiException {
        try {
            return this.spotifyApi.getInformationAboutUsersCurrentPlayback().build().execute();
        }
        catch (IOException | ParseException e)
        {
            System.out.println("Exception in player/getPlayer");
            System.out.println(e);
            return null;
        }
    }

    /**
     * Get the currently playing track, if there is one
     *
     * @return CurrentlyPlaying for track
     */
    @GetMapping(value = "/getCurrentlyPlaying")
    public CurrentlyPlaying getCurrentlyPlaying() throws SpotifyWebApiException {
        try {
            return this.spotifyApi.getUsersCurrentlyPlayingTrack().build().execute();
        } catch (IOException | ParseException e)
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
     * Set playback to last played track
     *
     * @return true if successful, false if not
     */
    @PostMapping(value = "/previous")
    public boolean previous() {
        try {
            this.spotifyApi.skipUsersPlaybackToPreviousTrack().build().execute();
            return true;
        }
        catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception in player/previous");
            System.out.println(e.getMessage());
            return false;
        }
    }


    /**
     * Removes all items from the queue and queues up the given track
     * Also sets shuffle and repeat to off, in case they aren't already
     *
     * @param trackURI URI of track to queue
     */
    @PutMapping(value = "/addToQueue")
    public void addToQueue(@RequestParam(name = "trackURI") String trackURI) throws SpotifyWebApiException {
        try {
            this.spotifyApi.addItemToUsersPlaybackQueue(trackURI).build().executeAsync().join();
            this.shuffle(false);
            this.repeat("off");
        }
        catch (CancellationException | CompletionException e)
        {
            System.out.println("Exception in player/addToQueue");
            System.out.println(e.getMessage());
        }
    }

    /**
     * Takes a Playlist URI and plays it on Spotify
     *
     * @param contextURI URI of playlist
     */
    @PutMapping(value = "/playPlaylist")
    public void playPlaylist(@RequestParam(name = "contextURI") String contextURI) {
        try {
            this.spotifyApi.startResumeUsersPlayback().context_uri(contextURI).build().execute();
        }
        catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception in player/playPlaylist");
            System.out.println(e.getMessage());
        }
    }

    /**
     * There's no way to play directly from a URI
     * ...sooo we set it to the queue, then skip to the next song
     * then we loop and keep skipping the track until it is the right one
     *
     * @param trackURI track to play
     * @return true if successful, false if not
     */
    @PutMapping(value = "/playTrack")
    public boolean playTrack(@RequestParam(name = "trackURI") String trackURI) throws SpotifyWebApiException {
        System.out.println("-----PLAYTRACK()-----");
        System.out.println("Trying to play: " + trackURI);
        try {
            AddItemToUsersPlaybackQueueRequest queue = this.spotifyApi.addItemToUsersPlaybackQueue(trackURI).build();
            SkipUsersPlaybackToNextTrackRequest skip = this.spotifyApi.skipUsersPlaybackToNextTrack().build();
            GetUsersCurrentlyPlayingTrackRequest now = this.spotifyApi.getUsersCurrentlyPlayingTrack().build();

            System.out.println("init current: " + now.executeAsync().get().getItem().getUri());
            // Use Future to make the async
            // Add the track to the queue
            String queueReturn = queue.executeAsync().get();
            System.out.println("1st queue: " + trackURI + " : " + queueReturn);

            // Delay...
            Thread.sleep(1300);

            // Skip to the next track
            String skipReturn = skip.executeAsync().get();
            System.out.println("1st skip: " + skipReturn);

            // Get the CurrentlyPlaying track to check if it was successful
            CurrentlyPlaying current = now.executeAsync().get();
            System.out.println("1st current: " + current.getItem().getUri());

            // We check current again in case it works and there's a dumb unpredictable delay
            if(!current.getItem().getUri().equals(trackURI)) {
                Thread.sleep(1000);
                current = now.executeAsync().get();
                System.out.println("1st loop current: " + current.getItem().getUri());
            }

            // We need to do this because there's nothing in the Spotify API to clear/adjust the queue :(
            // Loop until the queue and current playing track is right
            int count = 0;
            int bigCount = 0;
            while(!current.getItem().getUri().equals(trackURI)) {
                // Skip to the next track and get the new current track
                skip.executeAsync().get();
                System.out.println("Loop skip");

                // Delay...
                Thread.sleep(1000);

                current = now.executeAsync().get();

                System.out.println("Loop current: " + current.getItem().getUri());

                if(current.getItem().getUri().equals(trackURI)) {
                    return true;
                }

                // If this has happened more than 5 times, maybe this function messed up
                // and it needs to be queued again
                count++;
                if(count > 3) {
                    queueReturn = queue.executeAsync().get();
                    count = 0;
                    bigCount++;
                    // Delay...
                    Thread.sleep(1000);
                }
                // If this is hit, then it's really struggling to play the track
                // So we give up lol
                if(bigCount > 2) {
                    System.out.println("Giving up in player/playTrack");
                    return false;
                }
            }
            return true;
        }
        catch (NullPointerException | InterruptedException | ExecutionException e) {
            System.out.println("Exception caught in player/playTrack");
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
    public Device playOn(@RequestParam String deviceID) {
        //Create a JSONArray and add the ID
        JsonArray deviceArray = new JsonArray();
        deviceArray.add(deviceID);

        try {
            this.spotifyApi.transferUsersPlayback(deviceArray).build().execute();
            System.out.println("Playback transferred!");
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
     *
     * IDK WHY BUT GRADLE/ANGULAR/PROXIES/WHATEVER BROKE THIS SO I JUST DID THE SAME THING WITH /setAMRadio
     * NEVER SPEAK TO ME ABOUT THIS METHOD, EVER
     */
    @GetMapping(value = "/getAMRadio")
    public Device getAMRadio() throws SpotifyWebApiException {
        Device[] myDevices = this.getDevices();
        if(myDevices != null) {
            for(Device device: myDevices) {
                if(device.getName().equals("am_radio")) {
                    return this.playOn(device.getId());
                }
            }
        }

        return null;
    }

    /**
     * Goes through the list of devices and sets am_radio as the active device if found
     *
     * @return an active spotify player device named am_radio
     */
    @GetMapping(value = "/setAMRadio")
    public Device setAMRadio() throws SpotifyWebApiException {
        try {
            // First get all the devices and find am_radio
            Device[] myDevices = this.spotifyApi.getUsersAvailableDevices().build().execute();
            for(Device device: myDevices) {
                if(device.getName().equals("am_radio")) {
                    //Create a JSONArray and add the ID, then transfer playback
                    JsonArray deviceArray = new JsonArray();
                    deviceArray.add(device.getId());
                    this.spotifyApi.transferUsersPlayback(deviceArray).build().execute();
                    return device;
                }
            }
        } catch (IOException | ParseException e) {
            System.out.println("Exception caught in getAMRadio");
            System.out.println(e.getMessage());
            return null;
        }

        return null;
    }

    /**
     * Gets a random recently played playlist, sets shuffle and repeat to true, and plays it
     */
    @GetMapping(value = "/startAMRadio")
    public PlaylistSimplified startAMRadio() throws SpotifyWebApiException {
        try {
            // Playback's already on am_radio, so we want to shuffle and repeat on a random recent playlist
            // and skip to the next track
            PlaylistSimplified[] lists = this.spotifyApi.getListOfCurrentUsersPlaylists().limit(25).build().execute().getItems();
            // toggle shuffle
            this.spotifyApi.toggleShuffleForUsersPlayback(true).build().execute();
            // toggle context repeat
            this.spotifyApi.setRepeatModeOnUsersPlayback("context").build().execute();

            // Get a random playlist and play a random track from it (so the queue gets reset)
            PlaylistSimplified randomPlaylist = lists[new Random().nextInt((lists.length))];
            PlaylistTrack[] tracks = spotifyApi.getPlaylistsItems(randomPlaylist.getId()).build().execute().getItems();
            PlaylistTrack randomTrack = tracks[new Random().nextInt((tracks.length))];
            boolean played = this.playTrack(randomTrack.getTrack().getUri());
            if(played) {
                this.playPlaylist(randomPlaylist.getUri());
            }
            return randomPlaylist;
        }
        catch (IOException | ParseException e)
        {
            System.out.println("Exception caught in player/seek");
            System.out.println(e.getMessage());
            return null;
        }
    }

    /**
     * Play the Player
     *
     * @return true if successful, false if not
     */
    @PutMapping(value = "/play")
    public boolean play() throws SpotifyWebApiException {
        try {
            this.spotifyApi.startResumeUsersPlayback().build().execute();
            return true;
        }
        catch (IOException | ParseException e)
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
    public boolean pause() throws SpotifyWebApiException {
        try {
            this.spotifyApi.pauseUsersPlayback().build().execute();
            return true;
        }
        catch (IOException | ParseException e)
        {
            System.out.println("Exception in player/pause");
            System.out.println(e.getMessage());
            return false;
        }
    }

    /**
     * Give this a time in milliseconds and it will seek the current device to that time!
     *
     * @param time ms time
     */
    @PutMapping(value = "/seek")
    public boolean seek(@RequestParam int time) throws SpotifyWebApiException {
        try {
            this.spotifyApi.seekToPositionInCurrentlyPlayingTrack(time).build().executeAsync().join();
            return true;
        }
        catch (CancellationException | CompletionException e) {
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
    public boolean shuffle(@RequestParam boolean activate) throws SpotifyWebApiException {
        try {
            this.spotifyApi.toggleShuffleForUsersPlayback(activate).build().execute();
            return true;
        }
        catch (IOException | ParseException e)
        {
            System.out.println("Exception caught in player/shuffle");
            System.out.println(e.getMessage());
            return false;
        }
    }

    /**
     * Toggle repeat mode for the player
     *
     * @param type 0 off, 1 context (album, playlist repeat), or 2 track (track repeat)
     * @return true if successful, false if not
     */
    @PutMapping(value = "/repeat")
    public boolean repeat(@RequestParam String type) throws SpotifyWebApiException {
        try {
            this.spotifyApi.setRepeatModeOnUsersPlayback(type).build().execute();
            return true;
        }
        catch (IOException | ParseException e)
        {
            System.out.println("Exception caught in player/repeat");
            System.out.println(e.getMessage());
            return false;
        }
    }

    /**
     * Change the volume of the spotify player
     *
     * @param percent 0 - 100 percent int value
     * @return true if successful, false if not
     */
    @PutMapping(value = "/volume")
    public boolean volume(@RequestParam int percent) throws SpotifyWebApiException
    {
        try {
            this.spotifyApi.setVolumeForUsersPlayback(percent).build().execute();
            return true;
        }
        catch (IOException | ParseException e)
        {
            System.out.println("Exception in player/volume");
            System.out.println(e.getMessage());
            return false;
        }
    }

    /**
     * Get all currently available devices for the user
     *
     * @return Device[] of all found Devices
     */
    @GetMapping(value = "/getDevices")
    public Device[] getDevices() throws SpotifyWebApiException {
        try {
            return this.spotifyApi.getUsersAvailableDevices().build().execute();
        } catch (IOException | ParseException e) {
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
    public Device getCurrentDevice() throws SpotifyWebApiException {
        Device[] myDevices = this.getDevices();

        if(myDevices != null) {
            for(Device device: myDevices) {
                if(device.getIs_active()) {
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
}

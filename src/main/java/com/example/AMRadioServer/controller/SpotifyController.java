package com.example.AMRadioServer.controller;

import com.example.AMRadioServer.config.SpotifyConfiguration;
import com.example.AMRadioServer.model.ResponseMessage;
import com.wrapper.spotify.SpotifyApi;
import com.wrapper.spotify.exceptions.SpotifyWebApiException;
import com.wrapper.spotify.model_objects.credentials.AuthorizationCodeCredentials;
import com.wrapper.spotify.model_objects.miscellaneous.AudioAnalysis;
import com.wrapper.spotify.model_objects.specification.*;
import com.wrapper.spotify.requests.authorization.authorization_code.AuthorizationCodeRequest;
import com.wrapper.spotify.requests.authorization.authorization_code.AuthorizationCodeUriRequest;
import org.apache.hc.core5.http.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.net.URI;

@RestController
// If you're wondering why you have CORS issues with a Controller and withCredentials, boy do I have the annotation for you
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
@SessionAttributes("spotifyApi")
@RequestMapping("/api/spotify")
public class SpotifyController {

    private final SpotifyApi spotifyApi;

    @Autowired
    public SpotifyController(SpotifyApi spotifyApi) {
        this.spotifyApi = spotifyApi;
    }

    /**
     * This is what the frontend hits when the user pushes the login button
     * It will use show_dialog to generate the proper url for the user to a Spotify auth page
     * We return the uri, then redirect on the client side (Spotify doesn't like it if you do it server side :/)
     *
     * @return Response message with uri
     */
    @GetMapping(value = "/login")
    public ResponseMessage spotifyLogin(HttpServletResponse response, HttpSession session) throws IOException {
        AuthorizationCodeUriRequest authorizationCodeUriRequest = spotifyApi.authorizationCodeUri()
                .scope("user-read-private, user-read-email, streaming, " +
                        "user-read-playback-state, user-read-currently-playing, " +
                        "user-modify-playback-state, playlist-modify-public, " +
                        "user-read-recently-played")
                .show_dialog(true)
                .build();

        final URI uri = authorizationCodeUriRequest.execute();

        return new ResponseMessage(uri.toString());
    }

    /**
     * The Spotify login page redirects to this route
     * It will take in the given code and get an Access token to be used in the future
     * Then it redirects to the frontend, with the token in the header
     *
     * @param userCode returned by Spotify login page
     * @param response the client to be redirected
     * @return a user access token
     * @throws IOException
     */
    @GetMapping(value = "/getUserCode")
    public String getSpotifyUserCode(@RequestParam("code") String userCode, HttpServletResponse response) throws IOException {
        AuthorizationCodeRequest authorizationCodeRequest = spotifyApi.authorizationCode(userCode).build();

        try {
            final AuthorizationCodeCredentials authorizationCodeCredentials = authorizationCodeRequest.execute();

            spotifyApi.setAccessToken(authorizationCodeCredentials.getAccessToken());
            spotifyApi.setRefreshToken(authorizationCodeCredentials.getRefreshToken());

        } catch (IOException | SpotifyWebApiException | org.apache.hc.core5.http.ParseException e) {
            response.sendRedirect(SpotifyConfiguration.url);
        }

        response.sendRedirect(SpotifyConfiguration.appURL);

        return spotifyApi.getAccessToken();
    }

    /**
     * Get all playlists for the signed in user
     *
     * @return PlaylistSimplified[] array of Playlists
     * (Spotify doesn't like returning actual Playlist objects, but a PlaylistSimplified has pretty much everything)
     */
    @GetMapping(value = "/getUserPlaylists")
    public PlaylistSimplified[] getUserPlaylists() throws SpotifyWebApiException {
        try {
            return spotifyApi.getListOfCurrentUsersPlaylists().limit(25).build().execute().getItems();
        }
        catch (IOException | ParseException e)
        {
            System.out.println("Exception caught in getUserPlaylists");
            System.out.println(e.getMessage());
            return null;
        }
    }

    @GetMapping(value = "/getPlaylistTracks")
    public PlaylistTrack[] getPlaylistTracks(@RequestParam String playlistID) throws SpotifyWebApiException {
        try {
            return spotifyApi.getPlaylistsItems(playlistID).build().execute().getItems();
        }
        catch (IOException | ParseException e)
        {
            System.out.println("Exception caught in getPlaylistTracks");
            System.out.println(e.getMessage());
            return null;
        }
    }

    /**
     * Get the signed in user's profile
     *
     * @return User object of signed in user
     */
    @GetMapping(value = "/getUser")
    public User getUser() throws SpotifyWebApiException {
        try {
            return spotifyApi.getCurrentUsersProfile().build().execute();
        } catch (IOException | ParseException e) {
            System.out.println("Exception caught in getUser");
            System.out.println(e.getMessage());
            return null;
        }
    }

    /**
     * Attempts to access playlist data and if rejected, throws an exception which will attempt to refresh tokens
     *
     * @return a valid access token
     */
    @GetMapping(value = "/checkTokens")
    public ResponseMessage checkTokens() throws SpotifyWebApiException {
        if(this.spotifyApi.getAccessToken() == null || this.spotifyApi.getRefreshToken() == null || this.getUserPlaylists() == null) {
            throw new SpotifyWebApiException("No refresh token found");
        }
        else {
            // If the playlists can be good, then the token is good!
            return new ResponseMessage(spotifyApi.getAccessToken());
        }
    }

    /**
     * Get the audio features for a track
     * @param trackID the track
     * @return the audio features array
     * @throws SpotifyWebApiException if it fails
     */
    @GetMapping(value = "/getAudioFeatures")
    public AudioFeatures getAudioFeatures(@RequestParam String trackID) throws SpotifyWebApiException {
        try {
            return this.spotifyApi.getAudioFeaturesForTrack(trackID).build().execute();
        } catch (IOException | ParseException e)
        {
            System.out.println("Exception caught in spotify/getAudioFeatures");
            System.out.println(e.getMessage());
            return null;
        }
    }

    /**
     * Get the audio analysis for a track
     * @param trackID the track
     * @return audio analysis array
     * @throws SpotifyWebApiException if it fails
     */
    @GetMapping(value = "/getAudioAnalysis")
    public AudioAnalysis getAudioAnalysis(@RequestParam String trackID) throws SpotifyWebApiException {
        try {
            return this.spotifyApi.getAudioAnalysisForTrack(trackID).build().execute();
        } catch (IOException | ParseException e)
        {
            System.out.println("Exception caught in spotify/getAudioAnalysis");
            System.out.println(e.getMessage());
            return null;
        }
    }
}

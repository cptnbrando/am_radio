package com.example.AMRadioServer.controller;

import com.example.AMRadioServer.model.ResponseMessage;
import com.wrapper.spotify.SpotifyApi;
import com.wrapper.spotify.exceptions.SpotifyWebApiException;
import com.wrapper.spotify.model_objects.credentials.AuthorizationCodeCredentials;
import com.wrapper.spotify.model_objects.specification.*;
import com.wrapper.spotify.requests.authorization.authorization_code.AuthorizationCodeRequest;
import com.wrapper.spotify.requests.authorization.authorization_code.AuthorizationCodeUriRequest;
import com.wrapper.spotify.requests.data.playlists.GetListOfCurrentUsersPlaylistsRequest;
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
    public String getSpotifyUserCode(@RequestParam("code") String userCode, HttpServletResponse response) throws IOException
    {
        AuthorizationCodeRequest authorizationCodeRequest = spotifyApi.authorizationCode(userCode).build();

        try {
            final AuthorizationCodeCredentials authorizationCodeCredentials = authorizationCodeRequest.execute();

            spotifyApi.setAccessToken(authorizationCodeCredentials.getAccessToken());
            spotifyApi.setRefreshToken(authorizationCodeCredentials.getRefreshToken());

        } catch (IOException | SpotifyWebApiException | org.apache.hc.core5.http.ParseException e) {
            response.sendRedirect("http://localhost:9015/");
        }

        response.sendRedirect("http://localhost:9015/app");

        return spotifyApi.getAccessToken();
    }

    /**
     * Get all playlists for the signed in user
     *
     * @return PlaylistSimplified[] array of Playlists
     * (Spotify doesn't like returning actual Playlist objects, but a PlaylistSimplified has pretty much everything)
     */
    @GetMapping(value = "/getUserPlaylists")
    public PlaylistSimplified[] getUserPlaylists()
    {
        final GetListOfCurrentUsersPlaylistsRequest getListOfCurrentUsersPlaylistsRequest = spotifyApi.getListOfCurrentUsersPlaylists()
                .limit(25)
                .build();

        try {
            // Simplified playlists contain track collections, so it should work. Idk what makes them simplified lol
            final Paging<PlaylistSimplified> playlistPaging = getListOfCurrentUsersPlaylistsRequest.execute();
            return playlistPaging.getItems();
        }
        catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception caught in getUserPlaylists");
            System.out.println(e.getMessage());
            return null;
        }
    }

    @GetMapping(value = "/getPlaylistTracks")
    public PlaylistTrack[] getPlaylistTracks(@RequestParam String playlistID)
    {
        try {
            Paging<PlaylistTrack> tracks = spotifyApi.getPlaylistsItems(playlistID).build().execute();
            return tracks.getItems();
        }
        catch (IOException | SpotifyWebApiException | ParseException e)
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
    public User getUser() {
        try {
            return spotifyApi.getCurrentUsersProfile().build().execute();
        } catch (IOException | SpotifyWebApiException | ParseException e)
        {
            System.out.println("Exception caught in getUser");
            System.out.println(e.getMessage());
            return null;
        }
    }

    /**
     * Attempts to access user data and if rejected, refreshes the tokens and returns new ones
     *
     * @return a valid access token
     */
    @GetMapping(value = "/checkTokens")
    public ResponseMessage checkTokens()
    {
        if(this.spotifyApi.getAccessToken() == null || this.getUserPlaylists() == null)
        {
            // This should get new tokens from the current refresh token, if there's one there
            String[] tokens;

            try {
                tokens = this.getNewTokens();
                this.spotifyApi.setAccessToken(tokens[0]);
                this.spotifyApi.setRefreshToken(tokens[1]);
            } catch (IOException | SpotifyWebApiException | ParseException e) {
                return null;
            }

            // 0 is the access token, 1 is the refresh token
            // yes, they get set in the getNewTokens function to the spotifyApi
            return new ResponseMessage(tokens[0]);
        }
        else
        {
            // If the playlists can be good, then the token is good!
            return new ResponseMessage(spotifyApi.getAccessToken());
        }
    }

    /**
     * Gets new valid access/refresh tokens and sets them to the api
     *
     * @return a valid access token
     */
    @GetMapping(value = "/newTokens")
    public ResponseMessage newTokens() {
        try {
            String[] tokens = this.getNewTokens();
            this.spotifyApi.setAccessToken(tokens[0]);
            this.spotifyApi.setRefreshToken(tokens[1]);
            return new ResponseMessage(this.spotifyApi.getAccessToken());
        } catch (IOException | SpotifyWebApiException | ParseException e) {
            System.out.println("Exception caught in newTokens(): " + e.getMessage());
            return null;
        }
    }

    /**
     * Trade the current refresh token for a new access token
     *
     * @return access token and refresh token
     */
    protected String[] getNewTokens() throws IOException, ParseException, SpotifyWebApiException {
        String clientID = spotifyApi.getClientId();
        String clientSecret = spotifyApi.getClientSecret();
        String refreshToken = spotifyApi.getRefreshToken();

        if(refreshToken == null || clientID == null || clientSecret == null)
        {
            throw new SpotifyWebApiException("No refresh token found");
        }

        AuthorizationCodeCredentials auth = spotifyApi.authorizationCodeRefresh(clientID, clientSecret, refreshToken).build().execute();

        String[] tokens = new String[2];
        tokens[0] = auth.getAccessToken();
        tokens[1] = auth.getRefreshToken();

        return tokens;
    }
}

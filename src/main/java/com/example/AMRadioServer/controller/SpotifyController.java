package com.example.AMRadioServer.controller;

import com.example.AMRadioServer.model.ResponseMessage;
import com.wrapper.spotify.SpotifyApi;
import com.wrapper.spotify.SpotifyHttpManager;
import com.wrapper.spotify.exceptions.SpotifyWebApiException;
import com.wrapper.spotify.model_objects.credentials.AuthorizationCodeCredentials;
import com.wrapper.spotify.model_objects.specification.Paging;
import com.wrapper.spotify.model_objects.specification.Playlist;
import com.wrapper.spotify.model_objects.specification.PlaylistSimplified;
import com.wrapper.spotify.model_objects.specification.User;
import com.wrapper.spotify.requests.authorization.authorization_code.AuthorizationCodeRequest;
import com.wrapper.spotify.requests.authorization.authorization_code.AuthorizationCodeUriRequest;
import com.wrapper.spotify.requests.data.playlists.GetListOfCurrentUsersPlaylistsRequest;
import com.wrapper.spotify.requests.data.playlists.GetListOfUsersPlaylistsRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;

@RestController
@RequestMapping("/api/spotify")
@NoArgsConstructor
@Getter
@Setter
@CrossOrigin
public class SpotifyController {
    private static final URI redirectURI = SpotifyHttpManager.makeUri("http://localhost:9015/api/spotify/getUserCode");
    private String code = "";

    private static final SpotifyApi spotifyApi = new SpotifyApi.Builder()
            .setClientId(System.getenv("SPOTIFY_CLI_ID"))
            .setClientSecret(System.getenv("SPOTIFY_CLI_SECRET"))
            .setRedirectUri(redirectURI)
            .build();

    /**
     * This is what the frontend hits when the user pushes the login button
     * It will use show_dialog to redirect the user to a Spotify auth page
     * Then the auth page will redirect to getUserCode() on successful login (done in spotify app dashboard)
     *
     * @return Response message with uri
     */
    @GetMapping(value = "/login")
    public ResponseMessage spotifyLogin() {
        AuthorizationCodeUriRequest authorizationCodeUriRequest = spotifyApi.authorizationCodeUri()
                .scope("user-read-private, user-read-email, streaming")
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
        System.out.println("In /getUserCode");
        code = userCode;
        AuthorizationCodeRequest authorizationCodeRequest = spotifyApi.authorizationCode(code).build();

        try {
            final AuthorizationCodeCredentials authorizationCodeCredentials = authorizationCodeRequest.execute();

            spotifyApi.setAccessToken(authorizationCodeCredentials.getAccessToken());
            spotifyApi.setRefreshToken(authorizationCodeCredentials.getRefreshToken());

            System.out.println("Expires in: " + authorizationCodeCredentials.getExpiresIn());

        } catch (IOException | SpotifyWebApiException | org.apache.hc.core5.http.ParseException e) {
            System.out.println("Error: " + e.getMessage());
        }

        //TODO Refresh token logic

        // We got the access token, so route back to the page and somehow give it the token after a redirect
//        response.addHeader("Access-Control-Expose-Headers", "x-some-header"); // set this to expose custom header
//        response.addHeader("accessToken", spotifyApi.getAccessToken());
//        response.addHeader("refreshToken", spotifyApi.getRefreshToken());

        // This should be changed in the future to just use the header
        // Now with the added refresh token, there's no way this can continue...
        response.sendRedirect("http://localhost:4200/app");
        return spotifyApi.getAccessToken();
    }

    @GetMapping(value = "/getUserPlaylists")
    public PlaylistSimplified[] getUserPlaylists()
    {
        final GetListOfCurrentUsersPlaylistsRequest getListOfCurrentUsersPlaylistsRequest = spotifyApi.getListOfCurrentUsersPlaylists()
                .limit(25)
                .offset(5)
                .build();

        try {
            // Simplified playlists contain track collections, so it should work. Idk what makes them simplified lol
            final Paging<PlaylistSimplified> playlistPaging = getListOfCurrentUsersPlaylistsRequest.execute();
            return playlistPaging.getItems();
        }
        catch (Exception e)
        {
            // An empty array is returned if it fails
            System.out.println("Error in getPlaylists: " + e.getMessage());
            return null;
        }
    }

    @GetMapping(value = "/getUser")
    public User getUser() {
        try {
            return spotifyApi.getCurrentUsersProfile().build().execute();
        } catch (Exception e)
        {
            System.out.println(e.getMessage());
            return null;
        }
    }

    @GetMapping(value = "/getAccessToken")
    public ResponseMessage getAccessToken() {
        String accessToken = spotifyApi.getAccessToken();
        if(this.getUserPlaylists() == null)
        {
            // TODO use refresh token to get a new access token
            return new ResponseMessage("NO TOKEN FOUND");
        }
        return new ResponseMessage(spotifyApi.getAccessToken());
    }
}

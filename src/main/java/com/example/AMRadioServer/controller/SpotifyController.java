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
import com.wrapper.spotify.requests.data.playlists.GetListOfUsersPlaylistsRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;

@RestController
@RequestMapping("/api/spotify")
@NoArgsConstructor
@AllArgsConstructor
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

    @GetMapping(value = "/login")
    public ResponseMessage spotifyLogin() {
        System.out.println("In /login");

        AuthorizationCodeUriRequest authorizationCodeUriRequest = spotifyApi.authorizationCodeUri()
                .scope("user-read-private, user-read-email, streaming")
                .show_dialog(true)
                .build();

        final URI uri = authorizationCodeUriRequest.execute();
        System.out.println(uri.toString());

        return new ResponseMessage(uri.toString());
    }

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
        response.addHeader("token", spotifyApi.getAccessToken());
        response.sendRedirect("http://localhost:4200/?token=" + spotifyApi.getAccessToken());
        return spotifyApi.getAccessToken();
    }

    @GetMapping(value = "/getPlaylists")
    public PlaylistSimplified[] getPlaylists() {
        System.out.println("In /getPlaylists");
        final GetListOfUsersPlaylistsRequest getListOfUsersPlaylistsRequest = spotifyApi.getListOfUsersPlaylists(spotifyApi.getClientId())
                .limit(25)
                .offset(5)
                .build();

        try {
            final Paging<PlaylistSimplified> playlistPaging = getListOfUsersPlaylistsRequest.execute();
            return playlistPaging.getItems();
        }
        catch (Exception e)
        {
            System.out.println("Error in getPlaylists: " + e.getMessage());
        }

        return new PlaylistSimplified[0];
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

    @GetMapping(value = "/secret")
    public ResponseMessage getClientSecret()
    {
        return new ResponseMessage(System.getenv("SPOTIFY_CLI_SECRET"));
    }

    @GetMapping(value = "/id")
    public ResponseMessage getClientID()
    {
        return new ResponseMessage(System.getenv("SPOTIFY_CLI_ID"));
    }
}

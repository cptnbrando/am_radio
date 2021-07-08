package com.example.AMRadioServer.config;

import com.wrapper.spotify.SpotifyApi;
import com.wrapper.spotify.exceptions.SpotifyWebApiException;
import com.wrapper.spotify.model_objects.credentials.AuthorizationCodeCredentials;
import org.apache.hc.core5.http.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@ControllerAdvice
public class SpotifyExceptionHandler {

    private final SpotifyApi spotifyApi;

    @Autowired
    public SpotifyExceptionHandler(SpotifyApi spotifyApi) {
        this.spotifyApi = spotifyApi;
    }

    /**
     * Gets new valid access/refresh tokens and sets them to the api
     *
     * @return a valid access token
     */
    private void newTokens() throws SpotifyWebApiException, IOException, ParseException {
        String clientID = spotifyApi.getClientId();
        String clientSecret = spotifyApi.getClientSecret();
        String refreshToken = spotifyApi.getRefreshToken();

        if(refreshToken == null || clientID == null || clientSecret == null) {
            throw new SpotifyWebApiException("No refresh token found");
        }

        AuthorizationCodeCredentials auth = spotifyApi.authorizationCodeRefresh(clientID, clientSecret, refreshToken).build().execute();
        this.spotifyApi.setAccessToken(auth.getAccessToken());
        this.spotifyApi.setRefreshToken(auth.getRefreshToken());

    }

    @SuppressWarnings("all")
    @ExceptionHandler(value = {SpotifyWebApiException.class})
    public String redirect(SpotifyWebApiException e, HttpServletResponse response) {
        // Catches Exception from newTokens()
        if(e.getMessage().equals("No refresh token found")) {
            return "redirect:" + SpotifyConfiguration.appURL;
        }

        // Catches invalid access tokens
        if(e.getMessage().equals("Invalid access token")) {
            try {
                this.newTokens();
                return null;
            } catch (Exception g) {
                return "redirect:" + SpotifyConfiguration.appURL;
            }
        }

        System.out.println("SpotifyExceptionHandler: " + e.getMessage());
        return null;
    }
}
